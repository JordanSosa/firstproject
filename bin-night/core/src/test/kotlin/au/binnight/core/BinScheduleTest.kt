package au.binnight.core

import au.binnight.core.model.BinConfig
import au.binnight.core.model.BinRule
import au.binnight.core.model.BinType
import au.binnight.core.model.Cadence
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.DayOfWeek
import java.time.LocalDate

class BinScheduleTest {

    private val tuesday = DayOfWeek.TUESDAY

    @Test
    fun `returns null when no rules configured`() {
        val config = BinConfig(collectionDayValue = tuesday.value, rules = emptyList())
        assertNull(nextCollectionOnOrAfter(config, LocalDate.of(2026, 4, 20)))
    }

    @Test
    fun `weekly bin is always out on collection day`() {
        val config = BinConfig(
            collectionDayValue = tuesday.value,
            rules = listOf(BinRule(BinType.RED, Cadence.WEEKLY)),
        )
        val monday = LocalDate.of(2026, 4, 20)
        val next = nextCollectionOnOrAfter(config, monday)!!
        assertEquals(LocalDate.of(2026, 4, 21), next.date)
        assertEquals(listOf(BinType.RED), next.bins)
        assertEquals(tuesday, next.date.dayOfWeek)
    }

    @Test
    fun `queried on collection day returns same day`() {
        val config = BinConfig(
            collectionDayValue = tuesday.value,
            rules = listOf(BinRule(BinType.RED, Cadence.WEEKLY)),
        )
        val sameDay = LocalDate.of(2026, 4, 21)
        val next = nextCollectionOnOrAfter(config, sameDay)!!
        assertEquals(sameDay, next.date)
    }

    @Test
    fun `fortnightly bin out on reference week`() {
        val referenceDate = LocalDate.of(2026, 4, 21)
        val config = BinConfig(
            collectionDayValue = tuesday.value,
            rules = listOf(
                BinRule(BinType.GREEN, Cadence.FORTNIGHTLY, referenceIsoDate = referenceDate.toString())
            ),
        )
        val onRefDay = binsScheduledFor(config, referenceDate)
        assertEquals(listOf(BinType.GREEN), onRefDay)

        val weekAfter = binsScheduledFor(config, referenceDate.plusWeeks(1))
        assertTrue(weekAfter.isEmpty(), "Fortnightly bin should be off on the alternate week")

        val twoWeeksAfter = binsScheduledFor(config, referenceDate.plusWeeks(2))
        assertEquals(listOf(BinType.GREEN), twoWeeksAfter)
    }

    @Test
    fun `fortnightly bin off week yields no collection even with other rules missing`() {
        val referenceDate = LocalDate.of(2026, 4, 21)
        val config = BinConfig(
            collectionDayValue = tuesday.value,
            rules = listOf(
                BinRule(BinType.GREEN, Cadence.FORTNIGHTLY, referenceIsoDate = referenceDate.toString())
            ),
        )
        val queriedOnOffWeek = LocalDate.of(2026, 4, 28)
        val next = nextCollectionOnOrAfter(config, queriedOnOffWeek)!!
        assertEquals(referenceDate.plusWeeks(2), next.date)
    }

    @Test
    fun `mixed weekly and fortnightly bins`() {
        val referenceDate = LocalDate.of(2026, 4, 21)
        val config = BinConfig(
            collectionDayValue = tuesday.value,
            rules = listOf(
                BinRule(BinType.RED, Cadence.WEEKLY),
                BinRule(BinType.YELLOW, Cadence.FORTNIGHTLY, referenceIsoDate = referenceDate.toString()),
                BinRule(BinType.GREEN, Cadence.FORTNIGHTLY, referenceIsoDate = referenceDate.plusWeeks(1).toString()),
            ),
        )

        val refWeek = binsScheduledFor(config, referenceDate)
        assertEquals(setOf(BinType.RED, BinType.YELLOW), refWeek.toSet())

        val offWeek = binsScheduledFor(config, referenceDate.plusWeeks(1))
        assertEquals(setOf(BinType.RED, BinType.GREEN), offWeek.toSet())
    }

    @Test
    fun `non-collection day returns no bins`() {
        val config = BinConfig(
            collectionDayValue = tuesday.value,
            rules = listOf(BinRule(BinType.RED, Cadence.WEEKLY)),
        )
        val wednesday = LocalDate.of(2026, 4, 22)
        assertTrue(binsScheduledFor(config, wednesday).isEmpty())
    }

    @Test
    fun `fortnightly without reference date is never out`() {
        val config = BinConfig(
            collectionDayValue = tuesday.value,
            rules = listOf(BinRule(BinType.GREEN, Cadence.FORTNIGHTLY, referenceIsoDate = null)),
        )
        val tue = LocalDate.of(2026, 4, 21)
        assertTrue(binsScheduledFor(config, tue).isEmpty())
    }

    @Test
    fun `fortnightly rotation works for dates before reference date`() {
        val referenceDate = LocalDate.of(2026, 4, 21)
        val config = BinConfig(
            collectionDayValue = tuesday.value,
            rules = listOf(
                BinRule(BinType.GREEN, Cadence.FORTNIGHTLY, referenceIsoDate = referenceDate.toString())
            ),
        )
        val twoWeeksBefore = binsScheduledFor(config, referenceDate.minusWeeks(2))
        assertEquals(listOf(BinType.GREEN), twoWeeksBefore)

        val oneWeekBefore = binsScheduledFor(config, referenceDate.minusWeeks(1))
        assertTrue(oneWeekBefore.isEmpty())
    }
}
