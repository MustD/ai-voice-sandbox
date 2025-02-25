package com.perfectart.ai

import dev.langchain4j.data.audio.Audio
import dev.langchain4j.data.message.AudioContent
import dev.langchain4j.data.message.SystemMessage
import dev.langchain4j.data.message.TextContent
import dev.langchain4j.data.message.UserMessage


object VoiceRecognizerService {
    private val model by lazy { Gemini.chatModel }

    fun recognize(audio: Audio): String {
        val systemMessage = SystemMessage.from(
            "You are voice recognizer service."
        )
        val userMessage = UserMessage.from(
            TextContent.from("Convert to text."),
            AudioContent.from(audio.base64Data(), "audio/wav"),
        )
        val response = model.chat(systemMessage, userMessage)
        return response.aiMessage().text()
    }
}