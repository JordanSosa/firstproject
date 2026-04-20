package au.binnight.app.data

import kotlinx.serialization.Serializable
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime

@Serializable
data class BinRule(
    val type: BinType,
    val cadence: Cadence,
    val referenceIsoDate: String? = null,
)

@Serializable
data class BinConfig(
    val collectionDayValue: Int = DayOfWeek.TUESDAY.value,
    val reminderHour: Int = 18,
    val reminderMinute: Int = 0,
    val rules: List<BinRule> = emptyList(),
    val onboarded: Boolean = false,
) {
    val collectionDay: DayOfWeek
        get() = DayOfWeek.of(collectionDayValue)

    val reminderTime: LocalTime
        get() = LocalTime.of(reminderHour, reminderMinute)
}

fun BinRule.referenceDate(): LocalDate? =
    referenceIsoDate?.let { LocalDate.parse(it) }
