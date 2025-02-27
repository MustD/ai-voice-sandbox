package com.perfectart

import com.perfectart.ai.VoiceRecognizerService
import com.perfectart.session.Context
import com.perfectart.wavUtils.ensureWavHeaders
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.flow.consumeAsFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.mapNotNull
import kotlinx.coroutines.flow.onEach
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

    routing {
        webSocket("/text2speech") {
            println("WebSocket '/input' connection opened.")
            val context = Context()

            runCatching {
                incoming.consumeAsFlow().mapNotNull {
                    when (it) {
                        is Frame.Binary -> it
                        is Frame.Text -> {
                            val text = it.readText()
                            when (text) {
                                "start" -> context.clear()
                                "stop" -> {
                                    context.getText().let {
                                        VoiceRecognizerService.clearText(context.getText())
                                    }.let { cleanResult ->
                                        send(Frame.Text("Result: $cleanResult"))
                                        cleanResult
                                    }.let { cleanResult ->
                                        VoiceRecognizerService.summarizeText(cleanResult)
                                    }.let { summary ->
                                        send(Frame.Text("Summary: $summary"))
                                        send(Frame.Text("============================================"))
                                    }
                                }
                            }
                            null
                        }

                        else -> null
                    }
                }.map {
                    it.readBytes().ensureWavHeaders()
                }.onEach {
                    context.addFile(it)
                }.map {
                    runCatching {
                        val audio = it.let { VoiceRecognizerService.byte2audio(it) }
                        val prev = context.getPrev().let { prev ->
                            if (prev.isEmpty()) null else VoiceRecognizerService.byte2audio(prev)
                        }
                        val result = VoiceRecognizerService.recognize(
                            audio = audio, prev = prev,
                        )
                        context.setPrev(it)
                        result
                    }.getOrDefault("Error 400, whatever")
                }.collect {
                    context.addText(it)
                    send(Frame.Text(it))
                }
            }.onFailure {
                println("WebSocket '/input' connection error: ${it.message}")
            }.onSuccess {
                println("WebSocket '/input' connection closed successfully.")
            }
        }
    }
}
