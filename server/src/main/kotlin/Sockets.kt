package com.perfectart

import com.perfectart.ai.VoiceRecognizerService
import dev.langchain4j.data.audio.Audio
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.consumeAsFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import kotlin.io.encoding.Base64
import kotlin.io.encoding.ExperimentalEncodingApi
import kotlin.time.Duration.Companion.seconds

@OptIn(ExperimentalEncodingApi::class)
fun Application.configureSockets() {
    install(WebSockets) {
        pingPeriod = 15.seconds
        timeout = 15.seconds
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    val broadcast = MutableSharedFlow<String>()
    val audio = Channel<ByteArray>(
        capacity = 1,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )

    launch {
        audio.consumeAsFlow().onEach {
//            val fileName = "audio-${OffsetDateTime.now()}.wav"
//            File(fileName).writeBytes(it)
        }.map {
            Audio.builder().base64Data(Base64.Default.encode(it)).build()
        }.map {
            kotlin.runCatching {
                VoiceRecognizerService.recognize(it)
            }.getOrDefault("Error 400, whatever")
        }.collect {
            broadcast.emit(it)
        }
    }

    routing {
        webSocket("/input") {
            for (frame in incoming) {
                if (frame is Frame.Binary) {
                    audio.send(frame.readBytes())
                }
            }
        }

        webSocket("/messages") { // websocketSession
            launch {
                broadcast.collect { message -> send(Frame.Text(message)) }
            }
            for (frame in incoming) {
                if (frame is Frame.Text) {
                    val text = frame.readText()
                    broadcast.emit("YOU SAID: $text")
                }
            }
        }
    }
}
