package au.binnight.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import au.binnight.app.data.BinConfig
import au.binnight.app.data.BinType
import au.binnight.app.domain.nextCollectionOnOrAfter
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Composable
fun HomeScreen(config: BinConfig, onEdit: () -> Unit) {
    val today = LocalDate.now()
    val next = nextCollectionOnOrAfter(config, today)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Bin Night", fontSize = 28.sp, fontWeight = FontWeight.Bold)

        if (next == null) {
            Text("No bins configured yet.")
        } else {
            val daysAway = ChronoUnit.DAYS.between(today, next.date)
            val when_ = when (daysAway) {
                0L -> "Tonight"
                1L -> "Tomorrow"
                else -> next.date.format(DateTimeFormatter.ofPattern("EEEE d MMM"))
            }
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(20.dp)) {
                    Text(when_, fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(12.dp))
                    Text("Put out:", fontSize = 14.sp)
                    Spacer(Modifier.height(8.dp))
                    next.bins.forEach { BinRow(it) }
                }
            }
        }

        Spacer(Modifier.height(8.dp))
        Button(onClick = onEdit) { Text("Edit schedule") }
    }
}

@Composable
private fun BinRow(bin: BinType) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 4.dp),
    ) {
        Box(
            modifier = Modifier
                .size(20.dp)
                .clip(CircleShape)
                .background(Color(bin.colorArgb))
        )
        Spacer(Modifier.size(12.dp))
        Text("${bin.emoji}  ${bin.displayName}", fontSize = 16.sp)
    }
}
