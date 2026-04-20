package au.binnight.app.notifications

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import au.binnight.app.BinNightApp
import au.binnight.app.MainActivity
import au.binnight.app.R
import au.binnight.app.data.BinConfigStore
import au.binnight.app.domain.binsScheduledFor
import kotlinx.coroutines.flow.first
import java.time.LocalDate

class BinReminderWorker(
    appContext: Context,
    params: WorkerParameters,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val config = BinConfigStore(applicationContext).configFlow.first()
        if (!config.onboarded) return Result.success()

        val tomorrow = LocalDate.now().plusDays(1)
        val bins = binsScheduledFor(config, tomorrow)
        if (bins.isEmpty()) return Result.success()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = ContextCompat.checkSelfPermission(
                applicationContext, Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) return Result.success()
        }

        val label = bins.joinToString("  ") { "${it.emoji} ${it.displayName}" }
        val tapIntent = Intent(applicationContext, MainActivity::class.java)
        val pending = PendingIntent.getActivity(
            applicationContext, 0, tapIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        val notification = NotificationCompat.Builder(applicationContext, BinNightApp.CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Bin night tomorrow")
            .setContentText(label)
            .setStyle(NotificationCompat.BigTextStyle().bigText(label))
            .setContentIntent(pending)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(applicationContext)
            .notify(NOTIFICATION_ID, notification)

        return Result.success()
    }

    companion object {
        const val NOTIFICATION_ID = 1001
    }
}
