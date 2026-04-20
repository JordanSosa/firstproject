import {
  BIN_TYPES,
  CADENCE,
  DAY_NAMES,
  nextCollectionOnOrAfter,
  upcomingCollections,
  todayIso,
} from './schedule.mjs';
import { generateIcs } from './ics.mjs';
import { loadConfig, saveConfig } from './storage.mjs';

const app = document.getElementById('app');

function defaultConfig() {
  const today = todayIso();
  return {
    collectionDayValue: 2,
    reminderHour: 18,
    reminderMinute: 0,
    rules: [
      { type: 'RED', cadence: CADENCE.WEEKLY, referenceIsoDate: null },
      { type: 'YELLOW', cadence: CADENCE.FORTNIGHTLY, referenceIsoDate: today },
    ],
    onboarded: false,
  };
}

let config = loadConfig() ?? defaultConfig();
let editing = false;

function render() {
  if (!config.onboarded || editing) renderOnboarding();
  else renderHome();
}

function renderHome() {
  const today = todayIso();
  const next = nextCollectionOnOrAfter(config, today);
  const upcoming = upcomingCollections(config, today, 6);

  app.innerHTML = `
    <h1>Bin Night</h1>
    <p class="tagline">Your bins, on your calendar.</p>

    ${next ? renderNextCard(next, today) : '<div class="card">No bins configured yet.</div>'}

    <h2>Next up</h2>
    <div class="card">
      ${upcoming.slice(0, 6).map((c) => renderUpcomingRow(c, today)).join('') || '<div class="small">Nothing scheduled.</div>'}
    </div>

    <h2>Add to your calendar</h2>
    <div class="card">
      <p class="small" style="margin-top:0">
        Downloads an <code>.ics</code> file with the next 52 bin nights.
        Open it on your phone or computer to import into Google Calendar,
        Apple Calendar, or Outlook — each event alerts you at ${formatHour(config.reminderHour, config.reminderMinute)} the evening before.
      </p>
      <div class="btn-row">
        <button class="primary" id="btn-download">Download calendar (.ics)</button>
      </div>
    </div>

    <div class="btn-row">
      <button id="btn-edit">Edit schedule</button>
    </div>

    <footer>Bin Night · stored locally in your browser</footer>
  `;

  document.getElementById('btn-edit').onclick = () => {
    editing = true;
    render();
  };
  document.getElementById('btn-download').onclick = downloadIcs;
}

function renderNextCard(next, today) {
  const daysAway = daysBetween(today, next.date);
  const when =
    daysAway === 0 ? 'Tonight' :
    daysAway === 1 ? 'Tomorrow' :
    formatFriendly(next.date);
  return `
    <div class="card next-card">
      <p class="next-when">${when}</p>
      <p class="next-date">${formatFullDate(next.date)}</p>
      ${next.bins.map(renderBinRow).join('')}
    </div>
  `;
}

function renderBinRow(typeKey) {
  const bin = BIN_TYPES[typeKey];
  return `
    <div class="bin-row">
      <div class="bin-dot" style="background:${bin.color}"></div>
      <div class="bin-label">${bin.emoji} ${bin.name}</div>
    </div>
  `;
}

function renderUpcomingRow(c, today) {
  const daysAway = daysBetween(today, c.date);
  const when =
    daysAway === 0 ? 'Today' :
    daysAway === 1 ? 'Tomorrow' :
    formatFriendly(c.date);
  return `
    <div class="upcoming-item">
      <div>
        <div>${when}</div>
        <div class="small">${formatFullDate(c.date)}</div>
      </div>
      <div class="upcoming-bins">
        ${c.bins.map((k) => `<div class="upcoming-bin-dot" title="${BIN_TYPES[k].name}" style="background:${BIN_TYPES[k].color}"></div>`).join('')}
      </div>
    </div>
  `;
}

function renderOnboarding() {
  const draft = structuredClone(config);

  app.innerHTML = `
    <h1>${config.onboarded ? 'Edit schedule' : 'Set up your bins'}</h1>
    <p class="tagline">This stays in your browser. No account, no tracking.</p>

    <fieldset>
      <legend>Collection day</legend>
      <div class="chip-row" id="day-chips">
        ${DAY_NAMES.map((name, i) => `
          <div class="chip ${draft.collectionDayValue === i + 1 ? 'selected' : ''}" data-day="${i + 1}">${name.slice(0, 3)}</div>
        `).join('')}
      </div>
    </fieldset>

    <fieldset>
      <legend>Reminder time (evening before)</legend>
      <div class="chip-row" id="time-chips">
        ${[16, 17, 18, 19, 20, 21].map((h) => `
          <div class="chip ${draft.reminderHour === h ? 'selected' : ''}" data-hour="${h}">${formatHour(h, 0)}</div>
        `).join('')}
      </div>
    </fieldset>

    <fieldset>
      <legend>Your bins</legend>
      ${Object.values(BIN_TYPES).map((bin) => renderBinConfig(bin, draft)).join('')}
    </fieldset>

    <div class="btn-row">
      ${config.onboarded ? '<button id="btn-cancel">Cancel</button>' : ''}
      <button class="primary" id="btn-save">Save</button>
    </div>
  `;

  document.getElementById('day-chips').onclick = (e) => {
    const chip = e.target.closest('[data-day]');
    if (!chip) return;
    draft.collectionDayValue = Number(chip.dataset.day);
    refreshDayChips(draft.collectionDayValue);
  };

  document.getElementById('time-chips').onclick = (e) => {
    const chip = e.target.closest('[data-hour]');
    if (!chip) return;
    draft.reminderHour = Number(chip.dataset.hour);
    refreshTimeChips(draft.reminderHour);
  };

  wireBinConfigHandlers(draft);

  if (config.onboarded) {
    document.getElementById('btn-cancel').onclick = () => {
      editing = false;
      render();
    };
  }

  document.getElementById('btn-save').onclick = () => {
    if (!draft.rules.length) {
      alert('Please select at least one bin.');
      return;
    }
    config = { ...draft, onboarded: true };
    saveConfig(config);
    editing = false;
    render();
  };
}

function refreshDayChips(selected) {
  document.querySelectorAll('#day-chips .chip').forEach((el) => {
    el.classList.toggle('selected', Number(el.dataset.day) === selected);
  });
}

function refreshTimeChips(selected) {
  document.querySelectorAll('#time-chips .chip').forEach((el) => {
    el.classList.toggle('selected', Number(el.dataset.hour) === selected);
  });
}

function renderBinConfig(bin, draft) {
  const rule = draft.rules.find((r) => r.type === bin.key);
  const checked = !!rule;
  const cadence = rule?.cadence ?? CADENCE.WEEKLY;
  const ref = rule?.referenceIsoDate ?? todayIso();
  return `
    <div class="bin-config" data-bin="${bin.key}">
      <div class="bin-config-header">
        <input type="checkbox" ${checked ? 'checked' : ''} data-role="toggle" />
        <div class="bin-dot" style="background:${bin.color}"></div>
        <strong>${bin.emoji} ${bin.name}</strong>
      </div>
      <div class="bin-config-body" ${checked ? '' : 'hidden'}>
        <div class="chip-row" data-role="cadence">
          <div class="chip ${cadence === CADENCE.WEEKLY ? 'selected' : ''}" data-cadence="WEEKLY">Weekly</div>
          <div class="chip ${cadence === CADENCE.FORTNIGHTLY ? 'selected' : ''}" data-cadence="FORTNIGHTLY">Fortnightly</div>
        </div>
        <label ${cadence === CADENCE.FORTNIGHTLY ? '' : 'hidden'} data-role="ref-label">
          <span class="small">Next time it goes out:</span><br>
          <input type="date" value="${ref}" data-role="ref" />
        </label>
      </div>
    </div>
  `;
}

function wireBinConfigHandlers(draft) {
  document.querySelectorAll('.bin-config').forEach((el) => {
    const binKey = el.dataset.bin;
    const body = el.querySelector('.bin-config-body');
    const toggle = el.querySelector('[data-role="toggle"]');
    const cadenceChips = el.querySelectorAll('[data-cadence]');
    const refLabel = el.querySelector('[data-role="ref-label"]');
    const refInput = el.querySelector('[data-role="ref"]');

    toggle.onchange = () => {
      if (toggle.checked) {
        body.hidden = false;
        const existing = draft.rules.find((r) => r.type === binKey);
        if (!existing) {
          draft.rules.push({ type: binKey, cadence: CADENCE.WEEKLY, referenceIsoDate: null });
        }
      } else {
        body.hidden = true;
        draft.rules = draft.rules.filter((r) => r.type !== binKey);
      }
    };

    cadenceChips.forEach((chip) => {
      chip.onclick = () => {
        cadenceChips.forEach((c) => c.classList.toggle('selected', c === chip));
        const rule = draft.rules.find((r) => r.type === binKey);
        if (!rule) return;
        rule.cadence = chip.dataset.cadence;
        if (rule.cadence === CADENCE.FORTNIGHTLY) {
          rule.referenceIsoDate = refInput.value || todayIso();
          refLabel.hidden = false;
        } else {
          rule.referenceIsoDate = null;
          refLabel.hidden = true;
        }
      };
    });

    refInput.onchange = () => {
      const rule = draft.rules.find((r) => r.type === binKey);
      if (rule) rule.referenceIsoDate = refInput.value;
    };
  });
}

function downloadIcs() {
  const upcoming = upcomingCollections(config, todayIso(), 52);
  const ics = generateIcs(upcoming, {
    reminderHour: config.reminderHour,
    reminderMinute: config.reminderMinute,
  });
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bin-night.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function daysBetween(aIso, bIso) {
  const [ay, am, ad] = aIso.split('-').map(Number);
  const [by, bm, bd] = bIso.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

function formatFriendly(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}

function formatFullDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatHour(h, m) {
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: m === 0 ? undefined : '2-digit' });
}

render();
