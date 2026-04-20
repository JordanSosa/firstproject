package au.binnight.app.data

import kotlinx.serialization.Serializable

@Serializable
enum class BinType(val displayName: String, val emoji: String, val colorArgb: Long) {
    RED("General waste", "🗑️", 0xFFD32F2F),
    YELLOW("Recycling", "♻️", 0xFFFBC02D),
    GREEN("Green waste", "🌱", 0xFF388E3C),
    FOGO("FOGO", "🥬", 0xFF6D4C41);
}

@Serializable
enum class Cadence { WEEKLY, FORTNIGHTLY }
