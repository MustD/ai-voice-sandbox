package com.perfectart.ai

import dev.langchain4j.data.audio.Audio
import dev.langchain4j.data.message.AudioContent
import dev.langchain4j.data.message.SystemMessage
import dev.langchain4j.data.message.TextContent
import dev.langchain4j.data.message.UserMessage
import kotlin.io.encoding.Base64
import kotlin.io.encoding.ExperimentalEncodingApi


object VoiceRecognizerService {
    private val model by lazy { Gemini.chatModel }

    @OptIn(ExperimentalEncodingApi::class)
    fun byte2audio(array: ByteArray): Audio = Audio.builder().base64Data(Base64.Default.encode(array)).build()

    fun summarizeText(text: String): String {
        val systemMessage = SystemMessage.from(
            """
                |Please summarize the following text into one or two sentences. 
                |Output should be in the same language as input.
                |""".trimMargin()
        )
        val messages = listOf(systemMessage, UserMessage.from(TextContent.from(text)))
        val response = model.chat(messages)
        return response.aiMessage().text()
    }

    fun clearText(text: String): String {
        val systemMessage =
            SystemMessage.from(
                """
                    |Given text from audio recognition result. 
                    |Please merge it into one sentence and correct possible chunk glue issues. 
                    |Output should be in the same language as input.
                    |""".trimMargin()
            )
        val messages = listOf(systemMessage, UserMessage.from(TextContent.from(text)))
        val response = model.chat(messages)
        return response.aiMessage().text()
    }

    fun recognize(audio: Audio, prev: Audio? = null): String {
        val systemMessage = SystemMessage.from(
            """
                |You are the voice recognizer service. 
                |Given current wav file and previous, please return text only for current wav file.
                |Previous file is just to avoid word splitting issue.
                |""".trimMargin()
        )
        val messages = listOfNotNull(
            systemMessage,
            prev?.let {
                UserMessage.from(
                    TextContent.from("This is previous wav file for context."),
                    AudioContent.from(prev.base64Data(), "audio/wav"),
                )
            },
            UserMessage.from(
                TextContent.from("This is current wav file and should be recognized."),
                AudioContent.from(audio.base64Data(), "audio/wav"),
            ),
        )
        val response = model.chat(messages)
        return response.aiMessage().text()
    }
}