package au.binnight.app.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.Json

private val Context.dataStore by preferencesDataStore(name = "bin_config")

class BinConfigStore(private val context: Context) {

    private val key = stringPreferencesKey("config_json")
    private val json = Json { ignoreUnknownKeys = true }

    val configFlow: Flow<BinConfig> = context.dataStore.data.map { prefs ->
        prefs[key]?.let { runCatching { json.decodeFromString<BinConfig>(it) }.getOrNull() }
            ?: BinConfig()
    }

    suspend fun save(config: BinConfig) {
        context.dataStore.edit { prefs ->
            prefs[key] = json.encodeToString(BinConfig.serializer(), config)
        }
    }
}
