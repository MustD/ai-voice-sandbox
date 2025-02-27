package com.perfectart.session

import kotlinx.coroutines.flow.MutableStateFlow
import java.io.File
import java.time.OffsetDateTime

class Context {
    private val prev = MutableStateFlow(byteArrayOf())
    private val text = MutableStateFlow("")
    private val files = MutableStateFlow(mapOf<String, ByteArray>())

    suspend fun clear() {
        prev.emit(byteArrayOf())
        text.emit("")
        files.emit(mapOf())
    }

    suspend fun setPrev(arr: ByteArray) = prev.emit(arr)
    fun getPrev() = prev.value

    suspend fun addText(str: String) = text.emit(text.value + str)
    fun getText() = text.value

    suspend fun addFile(arr: ByteArray) = files.emit(files.value + (OffsetDateTime.now().toString() to arr))
    fun getWholeFile() = files.value.values.reduce { acc, bytes -> acc + bytes }
    fun saveFiles() = files.value.onEach { (date, content) ->
        val fileName = "audio-${date}.wav"
        File(fileName).writeBytes(content)
    }
}