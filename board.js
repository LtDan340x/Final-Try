const el = {
  boardEventName: document.getElementById('boardEventName'),
  boardRound: document.getElementById('boardRound'),
  boardStatus: document.getElementById('boardStatus'),
  boardAlert: document.getElementById('boardAlert'),
  boardPairings: document.getElementById('boardPairings'),
  boardLanes: document.getElementById('boardLanes')
};

function renderBoardPairing(pairing, idx) {
  if (pairing.type === 'bye') {
    return `
      <div class="pairing-card winner-card">
        <div class="panel-head"><strong>Pair ${idx + 1}</strong><span class="bye-badge">Bye Winner</span></div>
        <div>${pairing.racer1.racerName} • ${pairing.racer1.carName}</div>
      </div>
    `;
  }
  const racer1Winner = pairing.winnerId === pairing.racer1.id;
  const racer2Winner = pairing.winnerId === pairing.racer2.id;
  return `
    <div class="pairing-card">
      <div class="panel-head"><strong>Pair ${idx + 1}</strong><span class="lane-badge">${pairing.winnerId ? 'Winner Set' : 'Live'}</span></div>
      <div class="versus winner-versus">
        <div class="lane-entrant ${racer1Winner ? 'winner-card' : ''}">
          <strong>${pairing.racer1.racerName}</strong>
          <div class="small">${pairing.racer1.carName}</div>
          ${racer1Winner ? '<div class="winner-pill">Winner</div>' : ''}
        </div>
        <div class="vs-badge">VS</div>
        <div class="text-right lane-entrant ${racer2Winner ? 'winner-card' : ''}">
          <strong>${pairing.racer2.racerName}</strong>
          <div class="small">${pairing.racer2.carName}</div>
          ${racer2Winner ? '<div class="winner-pill">Winner</div>' : ''}
        </div>
      </div>
    </div>
  `;
}

function renderLaneCard(pairing) {
  if (pairing.type === 'bye') {
    return `
      <div class="lane-card winner-card">
        <div class="panel-head"><strong>Bye Lane</strong><span class="bye-badge">Auto Win</span></div>
        <div>${pairing.racer1.racerName}</div>
      </div>
    `;
  }

  const left = pairing.lanes.find((l) => l.lane === 'Left');
  const right = pairing.lanes.find((l) => l.lane === 'Right');
  const leftRacer = [pairing.racer1, pairing.racer2].find((r) => r.id === left?.racerId);
  const rightRacer = [pairing.racer1, pairing.racer2].find((r) => r.id === right?.racerId);
  const leftWinner = pairing.winnerId && pairing.winnerId === leftRacer?.id;
  const rightWinner = pairing.winnerId && pairing.winnerId === rightRacer?.id;
  return `
    <div class="lane-card">
      <div class="versus winner-versus">
        <div class="lane-entrant ${leftWinner ? 'winner-card' : ''}">
          <span class="lane-badge">Left</span>
          <strong>${leftRacer?.racerName || '-'}</strong>
          <div class="small">${leftRacer?.carName || ''}</div>
          ${leftWinner ? '<div class="winner-pill">Winner</div>' : ''}
        </div>
        <div class="vs-badge">|</div>
        <div class="text-right lane-entrant ${rightWinner ? 'winner-card' : ''}">
          <span class="lane-badge">Right</span>
          <strong>${rightRacer?.racerName || '-'}</strong>
          <div class="small">${rightRacer?.carName || ''}</div>
          ${rightWinner ? '<div class="winner-pill">Winner</div>' : ''}
        </div>
      </div>
    </div>
  `;
}

async function renderBoard() {
  const state = await AppState.getState();
  el.boardEventName.textContent = state.eventName || 'H-Town Hitters Race App';
  el.boardRound.textContent = state.round || 1;
  el.boardStatus.textContent = state.status || 'Staging';
  el.boardPairings.innerHTML = state.pairings.length ? state.pairings.map(renderBoardPairing).join('') : '<div class="empty-state">Waiting for pairings.</div>';
  el.boardLanes.innerHTML = state.pairings.length ? state.pairings.map(renderLaneCard).join('') : '<div class="empty-state">Lane board will show after pairings are generated.</div>';
  if (state.callMessage) {
    el.boardAlert.classList.remove('hidden');
    el.boardAlert.textContent = state.callMessage;
  } else {
    el.boardAlert.classList.add('hidden');
  }
}

AppState.listen(() => renderBoard());
setInterval(renderBoard, 1000);
renderBoard();
