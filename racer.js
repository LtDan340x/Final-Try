const nodes = {
  eventName: document.getElementById('racerEventName'),
  summaryRound: document.getElementById('summaryRound'),
  summaryStatus: document.getElementById('summaryStatus'),
  summaryPairings: document.getElementById('summaryPairings'),
  racerCards: document.getElementById('racerCards'),
  alertBanner: document.getElementById('alertBanner'),
  searchInput: document.getElementById('searchInput')
};

let latestState = null;

function pairingToCard(pairing) {
  if (pairing.type === 'bye') {
    const racer = pairing.racer1;
    return `
      <article class="racer-card glass">
        <img src="${racer.carImage}" alt="${racer.carName}" />
        <span class="bye-badge">Competition Bye</span>
        <h3>${racer.racerName}</h3>
        <p class="muted">${racer.carName} ${racer.carNumber ? `• ${racer.carNumber}` : ''}</p>
        <p class="muted">This racer received the bye this round.</p>
      </article>
    `;
  }

  const lane1 = pairing.lanes.find((l) => l.racerId === pairing.racer1.id)?.lane || '';
  const lane2 = pairing.lanes.find((l) => l.racerId === pairing.racer2.id)?.lane || '';

  return `
    <article class="racer-card glass">
      <div class="versus">
        <div>
          <img src="${pairing.racer1.carImage}" alt="${pairing.racer1.carName}" class="car-thumb" />
          <strong>${pairing.racer1.racerName}</strong>
          <div class="small">${pairing.racer1.carName} ${pairing.racer1.carNumber ? `• ${pairing.racer1.carNumber}` : ''}</div>
          <div class="lane-badge">${lane1} Lane</div>
        </div>
        <div class="vs-badge">VS</div>
        <div class="text-right">
          <img src="${pairing.racer2.carImage}" alt="${pairing.racer2.carName}" class="car-thumb" />
          <strong>${pairing.racer2.racerName}</strong>
          <div class="small">${pairing.racer2.carName} ${pairing.racer2.carNumber ? `• ${pairing.racer2.carNumber}` : ''}</div>
          <div class="lane-badge">${lane2} Lane</div>
        </div>
      </div>
    </article>
  `;
}

async function renderRacer() {
  latestState = await AppState.getState();
  nodes.eventName.textContent = latestState.eventName || 'H-Town Hitters Race App';
  nodes.summaryRound.textContent = latestState.round || 1;
  nodes.summaryStatus.textContent = latestState.status || 'Staging';
  nodes.summaryPairings.textContent = latestState.pairings.length;

  if (latestState.callMessage) {
    nodes.alertBanner.classList.remove('hidden');
    nodes.alertBanner.textContent = latestState.callMessage;
  } else {
    nodes.alertBanner.classList.add('hidden');
    nodes.alertBanner.textContent = '';
  }

  const term = nodes.searchInput.value.trim().toLowerCase();
  const filtered = latestState.pairings.filter((pair) => {
    if (!term) return true;
    const hay = [
      pair.racer1?.racerName,
      pair.racer1?.carName,
      pair.racer2?.racerName,
      pair.racer2?.carName
    ].join(' ').toLowerCase();
    return hay.includes(term);
  });

  nodes.racerCards.innerHTML = filtered.length
    ? filtered.map(pairingToCard).join('')
    : '<div class="empty-state">No pairings match your search.</div>';
}

document.getElementById('racerRefreshBtn').addEventListener('click', renderRacer);
nodes.searchInput.addEventListener('input', renderRacer);
AppState.listen(() => renderRacer());
setInterval(renderRacer, 1000);
renderRacer();
