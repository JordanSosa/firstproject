package au.binnight.app.ui.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import au.binnight.core.model.BinConfig
import au.binnight.core.model.BinRule
import au.binnight.core.model.BinType
import au.binnight.core.model.Cadence
import java.time.DayOfWeek
import java.time.LocalDate

@Composable
fun OnboardingScreen(
    initial: BinConfig,
    onSave: (BinConfig) -> Unit,
    onCancel: () -> Unit,
    allowCancel: Boolean,
) {
    var collectionDay by remember { mutableStateOf(initial.collectionDay) }
    var reminderHour by remember { mutableStateOf(initial.reminderHour) }

    val selected = remember {
        mutableStateListOf<BinType>().apply {
            addAll(initial.rules.map { it.type }.ifEmpty { listOf(BinType.RED, BinType.YELLOW) })
        }
    }
    val cadences = remember {
        mutableStateMapOf<BinType, Cadence>().apply {
            BinType.values().forEach { put(it, initial.rules.firstOrNull { r -> r.type == it }?.cadence ?: Cadence.WEEKLY) }
        }
    }
    val referenceDates = remember {
        mutableStateMapOf<BinType, LocalDate>().apply {
            BinType.values().forEach {
                val fromInitial = initial.rules.firstOrNull { r -> r.type == it }
                    ?.referenceIsoDate?.let(LocalDate::parse)
                put(it, fromInitial ?: LocalDate.now())
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Set up your bins", fontSize = 24.sp, fontWeight = FontWeight.Bold)

        Text("Collection day", fontWeight = FontWeight.SemiBold)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            DayOfWeek.values().forEach { day ->
                FilterChip(
                    selected = day == collectionDay,
                    onClick = { collectionDay = day },
                    label = { Text(day.name.take(3)) },
                )
            }
        }

        Text("Reminder time (evening before)", fontWeight = FontWeight.SemiBold)
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf(16, 17, 18, 19, 20, 21).forEach { h ->
                FilterChip(
                    selected = h == reminderHour,
                    onClick = { reminderHour = h },
                    label = { Text("${h}:00") },
                )
            }
        }

        Text("Your bins", fontWeight = FontWeight.SemiBold)
        BinType.values().forEach { type ->
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = selected.contains(type),
                        onCheckedChange = {
                            if (it) selected.add(type) else selected.remove(type)
                        },
                    )
                    Text("${type.emoji}  ${type.displayName}")
                }
                if (selected.contains(type)) {
                    Row(
                        modifier = Modifier.padding(start = 40.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Cadence.values().forEach { c ->
                            FilterChip(
                                selected = cadences[type] == c,
                                onClick = { cadences[type] = c },
                                label = { Text(if (c == Cadence.WEEKLY) "Weekly" else "Fortnightly") },
                            )
                        }
                    }
                    if (cadences[type] == Cadence.FORTNIGHTLY) {
                        Text(
                            text = "Next out: ${referenceDates[type]} (tap to shift by a week)",
                            fontSize = 12.sp,
                            modifier = Modifier
                                .padding(start = 40.dp, top = 4.dp)
                                .fillMaxWidth(),
                        )
                        Row(
                            modifier = Modifier.padding(start = 40.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            OutlinedButton(onClick = {
                                referenceDates[type] = referenceDates[type]!!.minusWeeks(1)
                            }) { Text("−1 wk") }
                            OutlinedButton(onClick = {
                                referenceDates[type] = referenceDates[type]!!.plusWeeks(1)
                            }) { Text("+1 wk") }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            if (allowCancel) OutlinedButton(onClick = onCancel) { Text("Cancel") }
            Button(
                enabled = selected.isNotEmpty(),
                onClick = {
                    val rules = selected.map { type ->
                        BinRule(
                            type = type,
                            cadence = cadences[type] ?: Cadence.WEEKLY,
                            referenceIsoDate = if (cadences[type] == Cadence.FORTNIGHTLY)
                                referenceDates[type]!!.toString() else null,
                        )
                    }
                    onSave(
                        BinConfig(
                            collectionDayValue = collectionDay.value,
                            reminderHour = reminderHour,
                            reminderMinute = 0,
                            rules = rules,
                            onboarded = true,
                        )
                    )
                },
            ) { Text("Save") }
        }
    }
}
