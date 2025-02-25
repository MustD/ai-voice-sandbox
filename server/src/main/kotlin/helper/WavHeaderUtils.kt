fun addWavHeader(audioData: ByteArray, sampleRate: Int = 44100, channels: Short = 1, bitsPerSample: Short = 16): ByteArray {
    // If the file already has a WAV header (44 bytes), return as is
    if (audioData.size >= 44 && isWavHeader(audioData)) {
        return audioData
    }

    // Create WAV header
    val header = ByteArray(44)

    // RIFF chunk
    "RIFF".toByteArray().copyInto(header, 0) // ChunkID
    (audioData.size + 36).toLittleEndianBytes().copyInto(header, 4) // ChunkSize
    "WAVE".toByteArray().copyInto(header, 8) // Format

    // fmt sub-chunk
    "fmt ".toByteArray().copyInto(header, 12) // Subchunk1ID
    16.toLittleEndianBytes().copyInto(header, 16) // Subchunk1Size (16 for PCM)
    1.toShort().toLittleEndianBytes().copyInto(header, 20) // AudioFormat (1 for PCM)
    channels.toLittleEndianBytes().copyInto(header, 22) // NumChannels
    sampleRate.toLittleEndianBytes().copyInto(header, 24) // SampleRate
    (sampleRate * channels * bitsPerSample / 8).toLittleEndianBytes().copyInto(header, 28) // ByteRate
    (channels * bitsPerSample / 8).toShort().toLittleEndianBytes().copyInto(header, 32) // BlockAlign
    bitsPerSample.toLittleEndianBytes().copyInto(header, 34) // BitsPerSample

    // data sub-chunk
    "data".toByteArray().copyInto(header, 36) // Subchunk2ID
    audioData.size.toLittleEndianBytes().copyInto(header, 40) // Subchunk2Size

    return header + audioData
}

// Helper functions
fun Int.toLittleEndianBytes(): ByteArray {
    return byteArrayOf(
        (this and 0xFF).toByte(),
        (this shr 8 and 0xFF).toByte(),
        (this shr 16 and 0xFF).toByte(),
        (this shr 24 and 0xFF).toByte()
    )
}

fun Short.toLittleEndianBytes(): ByteArray {
    return byteArrayOf(
        (this.toInt() and 0xFF).toByte(),
        (this.toInt() shr 8 and 0xFF).toByte()
    )
}

fun isWavHeader(data: ByteArray): Boolean {
    if (data.size < 44) return false
    val riff = String(data.sliceArray(0..3))
    val wave = String(data.sliceArray(8..11))
    return riff == "RIFF" && wave == "WAVE"
}