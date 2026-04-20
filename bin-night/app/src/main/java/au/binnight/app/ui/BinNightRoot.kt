package au.binnight.app.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import au.binnight.app.data.BinConfigStore
import au.binnight.app.ui.home.HomeScreen
import au.binnight.app.ui.onboarding.OnboardingScreen
import kotlinx.coroutines.launch

@Composable
fun BinNightRoot(store: BinConfigStore, onConfigSaved: () -> Unit) {
    val config by store.configFlow.collectAsState(initial = null)
    var editing by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val current = config ?: return

    if (!current.onboarded || editing) {
        OnboardingScreen(
            initial = current,
            onSave = { new ->
                scope.launch {
                    store.save(new.copy(onboarded = true))
                    editing = false
                    onConfigSaved()
                }
            },
            onCancel = { if (current.onboarded) editing = false },
            allowCancel = current.onboarded,
        )
    } else {
        HomeScreen(
            config = current,
            onEdit = { editing = true },
        )
    }
}
