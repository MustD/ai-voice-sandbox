package com.perfectart

import io.ktor.server.application.*
import io.ktor.server.config.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureSerialization()
    configureSockets()
    configureRouting()
}

object Config {
    private val config by lazy { ApplicationConfig(null) }
    val geminiApiKey by lazy { runCatching { config.property("geminiApiKey").getString() }.getOrDefault("") }
}
