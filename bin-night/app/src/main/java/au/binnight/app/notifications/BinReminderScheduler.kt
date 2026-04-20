package au.binnight.app.notifications

import android.content.Context
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import au.binnight.app.data.BinConfigStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import java.util.concurrent.TimeUnit

object BinReminderScheduler {
    private const val WORK_NAME = "bin_reminder_daily"

    fun schedule(context: Context) {
        val config = runBlocking { BinConfigStore(context).configFlow.first() }
        val now = LocalDateTime.now()
        val todayFire = LocalDateTime.of(LocalDate.now(), LocalTime.of(config.reminderHour, config.reminderMinute))
        val firstFire = if (todayFire.isAfter(now)) todayFire else todayFire.plusDays(1)
        val initialDelayMillis = ChronoUnit.MILLIS.between(
            now.atZone(ZoneId.systemDefault()).toInstant(),
            firstFire.atZone(ZoneId.systemDefault()).toInstant(),
        )

        val request = PeriodicWorkRequestBuilder<BinReminderWorker>(1, TimeUnit.DAYS)
            .setInitialDelay(initialDelayMillis, TimeUnit.MILLISECONDS)
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            WORK_NAME,
            ExistingPeriodicWorkPolicy.UPDATE,
            request,
        )
    }
}
