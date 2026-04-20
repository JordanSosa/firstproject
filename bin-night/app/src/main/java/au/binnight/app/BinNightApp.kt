package au.binnight.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import au.binnight.app.data.BinConfigStore
import au.binnight.app.notifications.BinReminderScheduler

class BinNightApp : Application() {
    lateinit var configStore: BinConfigStore
        private set

    override fun onCreate() {
        super.onCreate()
        configStore = BinConfigStore(this)
        createNotificationChannel()
        BinReminderScheduler.schedule(this)
    }

    private fun createNotificationChannel() {
        val mgr = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(
            CHANNEL_ID,
            getString(R.string.notification_channel_name),
            NotificationManager.IMPORTANCE_DEFAULT,
        ).apply {
            description = getString(R.string.notification_channel_desc)
        }
        mgr.createNotificationChannel(channel)
    }

    companion object {
        const val CHANNEL_ID = "bin_reminders"
    }
}
