package com.perfectart

import com.perfectart.ai.VoiceRecognizerService
import com.perfectart.wavUtils.ensureWavHeaders
import dev.langchain4j.data.audio.Audio
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
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
        capacity = 10,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )

    launch {
        audio.consumeAsFlow().map {
            it.ensureWavHeaders()
        }.onEach {
//            val fileName = "audio-${OffsetDateTime.now()}.wav"
//            File(fileName).writeBytes(it)
        }.map {
            Audio.builder().base64Data(Base64.Default.encode(it)).build()
        }.map {
            runCatching {
                VoiceRecognizerService.recognize(it)
            }.getOrDefault("Error 400, whatever")
        }.collect {
            broadcast.emit(it)
        }
    }

    routing {
        webSocket("/input") {
            println("WebSocket '/input' connection opened.")
            runCatching {
                incoming.consumeAsFlow().mapNotNull { it as? Frame.Binary }.collect { frame ->
                    audio.send(frame.readBytes())
                }
            }.onFailure {
                println("WebSocket '/input' connection error: ${it.message}")
            }.onSuccess {
                println("WebSocket '/input' connection closed successfully.")
            }
        }

        webSocket("/messages") { // websocketSession
            println("WebSocket '/messages' connection opened.")

            launch { broadcast.collect { message -> send(Frame.Text(message)) } }

            runCatching {
                incoming.consumeAsFlow().mapNotNull { it as? Frame.Text }.collect { frame ->
                    val text = frame.readText()
                    broadcast.emit("YOU SAID: $text")
                }
            }.onFailure {
                println("WebSocket '/messages' connection error: ${it.message}")
            }.onSuccess {
                println("WebSocket '/messages' connection closed successfully.")
            }
        }
    }
}
