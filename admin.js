const $ = (id) => document.getElementById(id);

const refs = {
  eventName: $('eventName'),
  adminCode: $('adminCode'),
  roundNumber: $('roundNumber'),
  eventStatus: $('eventStatus'),
  callMessage: $('callMessage'),
  racerName: $('racerName'),
  carName: $('carName'),
  carNumber: $('carNumber'),
  carImage: $('carImage'),
  racerList: $('racerList'),
  pairingsList: $('pairingsList'),
  racerCount: $('racerCount'),
  syncMode: $('syncMode'),
  shareLink: $('shareLink'),
  syncHint: $('syncHint'),
  autoModeBtn: $('autoModeBtn'),
  onlineModeBtn: $('onlineModeBtn'),
  localModeBtn: $('localModeBtn')
};

let currentState = null;

function racerCard(racer) {
  return `
    <div class="entry-card">
      <div class="entry-meta">
        <strong>${racer.racerName}</strong>
        <div class="entry-sub">${racer.carName} ${racer.carNumber ? `• ${racer.carNumber}` : ''}</div>
        <div class="small">Bye used: ${racer.hadBye ? 'Yes' : 'No'}</div>
      </div>
      <div class="entry-actions">
        <button class="btn btn-secondary" onclick="toggleActive('${racer.id}')">${racer.active === false ? 'Activate' : 'Scratch'}</button>
        <button class="btn btn-danger" onclick="removeRacer('${racer.id}')">Delete</button>
      </div>
    </div>
  `;
}

function pairingCard(pairing, idx) {
  if (pairing.type === 'bye') {
    return `
      <div class="pairing-card winner-card">
        <div class="panel-head">
          <strong>Pair ${idx + 1}</strong>
          <span class="bye-badge">Bye Winner</span>
        </div>
        <div>${pairing.racer1.racerName} • ${pairing.racer1.carName}</div>
      </div>
    `;
  }

  const lane1 = pairing.lanes.find((l) => l.racerId === pairing.racer1.id)?.lane || '';
  const lane2 = pairing.lanes.find((l) => l.racerId === pairing.racer2.id)?.lane || '';
  const racer1Winner = pairing.winnerId === pairing.racer1.id;
  const racer2Winner = pairing.winnerId === pairing.racer2.id;

  return `
    <div class="pairing-card">
      <div class="panel-head">
        <strong>Pair ${idx + 1}</strong>
        <span class="lane-badge">${lane1} / ${lane2}</span>
      </div>
      <div class="versus winner-versus">
        <div class="lane-entrant ${racer1Winner ? 'winner-card' : ''}">
          <strong>${pairing.racer1.racerName}</strong>
          <div class="small">${pairing.racer1.carName} • ${lane1}</div>
          ${racer1Winner ? '<div class="winner-pill">Winner</div>' : ''}
        </div>
        <div class="vs-badge">VS</div>
        <div class="text-right lane-entrant ${racer2Winner ? 'winner-card' : ''}">
          <strong>${pairing.racer2.racerName}</strong>
          <div class="small">${pairing.racer2.carName} • ${lane2}</div>
          ${racer2Winner ? '<div class="winner-pill">Winner</div>' : ''}
        </div>
      </div>
      <div class="inline-actions wrap lane-win-actions compact-actions">
        <button class="btn ${racer1Winner ? 'btn-primary' : 'btn-secondary'}" onclick="setLaneWinner('${pairing.id}', '${pairing.racer1.id}')">${lane1} Lane Winner</button>
        <button class="btn ${racer2Winner ? 'btn-primary' : 'btn-secondary'}" onclick="setLaneWinner('${pairing.id}', '${pairing.racer2.id}')">${lane2} Lane Winner</button>
        <button class="btn btn-danger" onclick="clearLaneWinner('${pairing.id}')">Clear</button>
      </div>
    </div>
  `;
}

async function paintSyncUi() {
  const resolved = await AppState.resolveTransportMode();
  const pref = resolved.preferred;
  refs.syncMode.textContent = resolved.actual === 'online' ? 'Online Live Sync' : 'Local Browser Mode';
  refs.syncMode.className = `status-value ${resolved.actual === 'online' ? 'online' : 'local'}`;
  refs.syncHint.textContent = resolved.remoteAvailable
    ? `Selected: ${pref}. Supabase connected.`
    : `Selected: ${pref}. Supabase not configured, so the app is using local mode.`;

  [refs.autoModeBtn, refs.onlineModeBtn, refs.localModeBtn].forEach((btn) => btn.classList.remove('active'));
  if (pref === 'auto') refs.autoModeBtn.classList.add('active');
  if (pref === 'online') refs.onlineModeBtn.classList.add('active');
  if (pref === 'local') refs.localModeBtn.classList.add('active');
}

async function render() {
  currentState = await AppState.getState();
  refs.eventName.value = currentState.eventName;
  refs.adminCode.value = currentState.adminCode || '';
  refs.roundNumber.value = currentState.round || 1;
  refs.eventStatus.value = currentState.status || 'Staging';
  refs.callMessage.value = currentState.callMessage || '';
  refs.racerCount.textContent = currentState.racers.length;
  refs.shareLink.textContent = `${location.origin}${location.pathname.replace('admin.html', 'racer.html')}`;

  refs.racerList.innerHTML = currentState.racers.length
    ? currentState.racers.map(racerCard).join('')
    : '<div class="empty-state">No racers added yet.</div>';

  refs.pairingsList.innerHTML = currentState.pairings.length
    ? currentState.pairings.map(pairingCard).join('')
    : '<div class="empty-state">No pairings generated yet.</div>';

  await paintSyncUi();
}

async function setSyncMode(mode) {
  AppState.setPreferredSyncMode(mode);
  await AppState.isRemoteAvailable(true);
  render();
}

refs.autoModeBtn.addEventListener('click', () => setSyncMode('auto'));
refs.onlineModeBtn.addEventListener('click', () => setSyncMode('online'));
refs.localModeBtn.addEventListener('click', () => setSyncMode('local'));

$('saveEventBtn').addEventListener('click', async () => {
  await AppState.updateState((state) => {
    state.eventName = refs.eventName.value.trim() || 'H-Town Hitters Race App';
    state.adminCode = refs.adminCode.value.trim();
    state.round = Number(refs.roundNumber.value) || 1;
    state.status = refs.eventStatus.value;
    state.callMessage = refs.callMessage.value.trim();
    return state;
  });
  render();
});

$('announceBtn').addEventListener('click', async () => {
  await AppState.updateState((state) => {
    state.status = 'Calling to Lanes';
    state.callMessage = refs.callMessage.value.trim() || `Round ${state.round} to the lanes now`;
    return state;
  });
  render();
});

$('addRacerBtn').addEventListener('click', async () => {
  const racer = AppState.makeRacer({
    racerName: refs.racerName.value,
    carName: refs.carName.value,
    carNumber: refs.carNumber.value,
    carImage: refs.carImage.value
  });
  await AppState.updateState((state) => {
    state.racers.push(racer);
    return state;
  });
  refs.racerName.value = '';
  refs.carName.value = '';
  refs.carNumber.value = '';
  refs.carImage.value = '';
  render();
});

$('demoDataBtn').addEventListener('click', async () => {
  await AppState.seedDemoData();
  render();
});

$('pairRoundBtn').addEventListener('click', async () => {
  await AppState.updateState((state) => {
    state.pairings = AppState.buildPairings(state.racers);
    state.pairings.forEach((pair) => {
      if (pair.type === 'bye') {
        const racer = state.racers.find((r) => r.id === pair.racer1.id);
        if (racer) racer.hadBye = true;
      }
    });
    state.status = 'Pairing';
    state.callMessage = `Round ${state.round} pairings are live`;
    return state;
  });
  render();
});

$('clearRoundBtn').addEventListener('click', async () => {
  await AppState.updateState((state) => {
    state.pairings = [];
    state.callMessage = '';
    state.status = 'Staging';
    return state;
  });
  render();
});

$('nextRoundBtn').addEventListener('click', async () => {
  await AppState.updateState((state) => {
    if (state.pairings.length) {
      const winnerIds = new Set(state.pairings.map((pair) => pair.winnerId).filter(Boolean));
      if (winnerIds.size) {
        state.racers.forEach((racer) => {
          racer.active = winnerIds.has(racer.id);
        });
      }
    }
    state.round = (Number(state.round) || 1) + 1;
    state.pairings = [];
    state.status = 'Staging';
    state.callMessage = '';
    return state;
  });
  render();
});

$('resetBtn').addEventListener('click', async () => {
  const sure = confirm('Reset the entire event, racers, and pairings?');
  if (!sure) return;
  await AppState.setState({
    eventName: 'H-Town Hitters Race App',
    adminCode: '',
    round: 1,
    status: 'Staging',
    callMessage: '',
    racers: [],
    pairings: []
  });
  render();
});

$('refreshBtn').addEventListener('click', render);

window.toggleActive = async (id) => {
  await AppState.updateState((state) => {
    const racer = state.racers.find((r) => r.id === id);
    if (racer) racer.active = racer.active === false ? true : false;
    return state;
  });
  render();
};

window.removeRacer = async (id) => {
  await AppState.updateState((state) => {
    state.racers = state.racers.filter((r) => r.id !== id);
    state.pairings = state.pairings.filter((p) => p.racer1?.id !== id && p.racer2?.id !== id);
    return state;
  });
  render();
};

AppState.listen(() => render());
render();


window.setLaneWinner = async (pairingId, racerId) => {
  await AppState.updateState((state) => {
    const pairing = state.pairings.find((pair) => pair.id === pairingId);
    if (pairing) pairing.winnerId = racerId;
    return state;
  });
  render();
};

window.clearLaneWinner = async (pairingId) => {
  await AppState.updateState((state) => {
    const pairing = state.pairings.find((pair) => pair.id === pairingId);
    if (pairing && pairing.type !== 'bye') pairing.winnerId = null;
    return state;
  });
  render();
};
