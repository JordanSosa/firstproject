package au.binnight.core

import au.binnight.core.model.BinConfig
import au.binnight.core.model.BinRule
import au.binnight.core.model.BinType
import au.binnight.core.model.Cadence
import au.binnight.core.model.referenceDate
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import kotlin.math.abs

data class NextCollection(val date: LocalDate, val bins: List<BinType>)

fun nextCollectionOnOrAfter(config: BinConfig, today: LocalDate): NextCollection? {
    if (config.rules.isEmpty()) return null
    var candidate = today
    val maxLookahead = 14
    repeat(maxLookahead) {
        if (candidate.dayOfWeek == config.collectionDay) {
            val bins = binsScheduledFor(config, candidate)
            if (bins.isNotEmpty()) return NextCollection(candidate, bins)
        }
        candidate = candidate.plusDays(1)
    }
    return null
}

fun binsScheduledFor(config: BinConfig, date: LocalDate): List<BinType> {
    if (date.dayOfWeek != config.collectionDay) return emptyList()
    return config.rules
        .filter { it.isOutOn(date) }
        .map { it.type }
}

private fun BinRule.isOutOn(date: LocalDate): Boolean = when (cadence) {
    Cadence.WEEKLY -> true
    Cadence.FORTNIGHTLY -> {
        val ref = referenceDate() ?: return false
        val weeks = abs(ChronoUnit.WEEKS.between(ref, date))
        weeks % 2 == 0L
    }
}
