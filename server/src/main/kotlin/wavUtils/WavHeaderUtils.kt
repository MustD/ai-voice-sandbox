package com.perfectart.wavUtils

fun ByteArray.ensureWavHeaders(): ByteArray {
    if (size >= 12 &&
        this[0] == 'R'.code.toByte() &&
        this[1] == 'I'.code.toByte() &&
        this[2] == 'F'.code.toByte() &&
        this[3] == 'F'.code.toByte() &&
        this[8] == 'W'.code.toByte() &&
        this[9] == 'A'.code.toByte() &&
        this[10] == 'V'.code.toByte() &&
        this[11] == 'E'.code.toByte()
    ) {
        return this
    }

    val audioData = this
    val headerSize = 44
    val totalDataLen = audioData.size + 36
    val wavData = ByteArray(headerSize + audioData.size)

    // RIFF header (no changes needed)
    wavData[0] = 'R'.code.toByte()
    wavData[1] = 'I'.code.toByte()
    wavData[2] = 'F'.code.toByte()
    wavData[3] = 'F'.code.toByte()
    wavData[4] = (totalDataLen and 0xff).toByte()
    wavData[5] = (totalDataLen shr 8 and 0xff).toByte()
    wavData[6] = (totalDataLen shr 16 and 0xff).toByte()
    wavData[7] = (totalDataLen shr 24 and 0xff).toByte()
    wavData[8] = 'W'.code.toByte()
    wavData[9] = 'A'.code.toByte()
    wavData[10] = 'V'.code.toByte()
    wavData[11] = 'E'.code.toByte()

    // FMT sub-chunk (no changes needed in ID)
    wavData[12] = 'f'.code.toByte()
    wavData[13] = 'm'.code.toByte()
    wavData[14] = 't'.code.toByte()
    wavData[15] = ' '.code.toByte()

    // Subchunk1 size (16 bytes)
    wavData[16] = 16
    wavData[17] = 0
    wavData[18] = 0
    wavData[19] = 0

    // Format type and channels (no changes needed)
    wavData[20] = 1
    wavData[21] = 0
    wavData[22] = 1
    wavData[23] = 0

    // Sample rate (48000 Hz = 0xBB80)
    wavData[24] = 0x80.toByte()
    wavData[25] = 0xBB.toByte()
    wavData[26] = 0x00.toByte()
    wavData[27] = 0x00.toByte()

    // Byte rate (0x017700)
    wavData[28] = 0x00.toByte()
    wavData[29] = 0x77.toByte()
    wavData[30] = 0x01.toByte()
    wavData[31] = 0x00.toByte()

    // Block align (2 bytes)
    wavData[32] = 2
    wavData[33] = 0

    // Bits per sample (16 bits)
    wavData[34] = 16
    wavData[35] = 0

    // Data sub-chunk (no changes needed in ID)
    wavData[36] = 'd'.code.toByte()
    wavData[37] = 'a'.code.toByte()
    wavData[38] = 't'.code.toByte()
    wavData[39] = 'a'.code.toByte()

    // Data size
    val dataSize = audioData.size
    wavData[40] = (dataSize and 0xff).toByte()
    wavData[41] = (dataSize shr 8 and 0xff).toByte()
    wavData[42] = (dataSize shr 16 and 0xff).toByte()
    wavData[43] = (dataSize shr 24 and 0xff).toByte()

    // Copy audio data
    System.arraycopy(audioData, 0, wavData, headerSize, audioData.size)

    return wavData
}