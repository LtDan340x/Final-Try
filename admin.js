
(function () {
  const app = window.RaceApp;
  const mode = "online";
  let state = app.clone(app.DEFAULT_STATE);

  const els = {
    syncStatus: document.getElementById("syncStatus"),
    eventName: document.getElementById("eventName"),
    currentRound: document.getElementById("currentRound"),
    trackStatus: document.getElementById("trackStatus"),
    callToLanesMessage: document.getElementById("callToLanesMessage"),
    racerName: document.getElementById("racerName"),
    carName: document.getElementById("carName"),
    carNumber: document.getElementById("carNumber"),
    carImageUrl: document.getElementById("carImageUrl"),
    racersList: document.getElementById("racersList"),
    pairingsList: document.getElementById("pairingsList")
  };

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch];
    });
  }

  function racerCard(r) {
    return '<div class="racer-card"><div><strong>' + escapeHtml(r.name) + '</strong><br/>' +
      escapeHtml(r.car || "Race Car") + ' ' + escapeHtml(r.number || "") + '<br/>Bye used: ' +
      (r.byeUsed ? "Yes" : "No") + '</div><div><button data-delete-racer="' + r.id + '">Delete</button></div></div>';
  }

  function pairingCard(pair, index) {
    const leftName = pair.left ? pair.left.name : "—";
    const rightName = pair.right ? pair.right.name : "BYE";
    let winnerText = "Not selected";
    if (pair.winnerId) {
      winnerText = (pair.left && pair.left.id === pair.winnerId) ? leftName : rightName;
    }
    return '<div class="pairing-card" data-pair-id="' + pair.id + '">' +
      '<div><strong>Pair ' + (index + 1) + '</strong></div>' +
      '<div>' + escapeHtml(leftName) + ' vs ' + escapeHtml(rightName) + '</div>' +
      '<div>Winner: ' + escapeHtml(winnerText) + '</div>' +
      '<div class="button-row" style="margin-top:8px;">' +
      '<button data-win="' + pair.id + '" data-side="left"' + (!pair.left ? ' disabled' : '') + '>Left Wins</button>' +
      '<button data-win="' + pair.id + '" data-side="right"' + (!pair.right ? ' disabled' : '') + '>Right Wins</button>' +
      '<button data-undo="' + pair.id + '">Undo</button>' +
      '</div></div>';
  }

  function render() {
    if (els.eventName) els.eventName.value = state.eventName || "";
    if (els.currentRound) els.currentRound.value = state.currentRound || 1;
    if (els.trackStatus) els.trackStatus.value = state.trackStatus || "Pairing";
    if (els.callToLanesMessage) els.callToLanesMessage.value = state.callToLanesMessage || "";

    if (els.racersList) {
      els.racersList.innerHTML = state.racers.length ? state.racers.map(racerCard).join("") : "No racers yet.";
    }
    if (els.pairingsList) {
      els.pairingsList.innerHTML = state.pairings.length ? state.pairings.map(pairingCard).join("") : "No pairings yet.";
    }
    if (els.syncStatus) {
      els.syncStatus.textContent = app.hasSupabase() ? "Online Mode ✅" : "Local Browser Mode";
    }
  }

  async function refreshState() {
    state = await app.getState(mode);
    render();
  }

  async function persist() {
    state = await app.saveState(state, mode);
    render();
  }

  async function saveEventSettingsHandler() {
    state.eventName = (els.eventName && els.eventName.value.trim()) || "H-Town Hitters Race App";
    state.currentRound = parseInt((els.currentRound && els.currentRound.value) || "1", 10);
    state.trackStatus = (els.trackStatus && els.trackStatus.value) || "Pairing";
    state.callToLanesMessage = (els.callToLanesMessage && els.callToLanesMessage.value) || "";
    await persist();
    alert("Event settings saved");
  }

  async function pushCallToLanesHandler() {
    state.callToLanesMessage = (els.callToLanesMessage && els.callToLanesMessage.value) || "";
    state.trackStatus = "Call To Lanes";
    await persist();
    alert("Call-to-lanes sent");
  }

  async function addRacerHandler() {
    const name = els.racerName && els.racerName.value.trim();
    if (!name) return alert("Enter racer name");
    state.racers.push({
      id: app.uid(),
      name: name,
      car: (els.carName && els.carName.value.trim()) || "Race Car",
      number: (els.carNumber && els.carNumber.value.trim()) || "",
      image: (els.carImageUrl && els.carImageUrl.value.trim()) || "",
      byeUsed: false,
      eliminated: false
    });
    if (els.racerName) els.racerName.value = "";
    if (els.carName) els.carName.value = "";
    if (els.carNumber) els.carNumber.value = "";
    if (els.carImageUrl) els.carImageUrl.value = "";
    await persist();
  }

  async function loadDemoRacersHandler() {
    state.racers = [
      { id: app.uid(), name: "kb", car: "Race Car", number: "", image: "", byeUsed: false, eliminated: false },
      { id: app.uid(), name: "ant", car: "Race Car", number: "", image: "", byeUsed: false, eliminated: false },
      { id: app.uid(), name: "phil", car: "Race Car", number: "", image: "", byeUsed: false, eliminated: false },
      { id: app.uid(), name: "brad", car: "Race Car", number: "", image: "", byeUsed: false, eliminated: false },
      { id: app.uid(), name: "luke", car: "Race Car", number: "", image: "", byeUsed: false, eliminated: false }
    ];
    state.pairings = [];
    state.winners = [];
    await persist();
  }

  async function generatePairingsHandler() {
    state.pairings = app.generatePairingsFromRacers(state.racers);
    state.winners = app.winnersFromPairings(state.pairings);
    state.trackStatus = "Pairing";
    await persist();
  }

  async function clearRoundHandler() {
    state.pairings = [];
    state.winners = [];
    await persist();
  }

  async function markWinner(pairId, side) {
    const pair = state.pairings.find(function (p) { return p.id === pairId; });
    if (!pair) return;
    if (side === "left" && pair.left) pair.winnerId = pair.left.id;
    if (side === "right" && pair.right) pair.winnerId = pair.right.id;
    pair.completed = !!pair.winnerId;
    state.winners = app.winnersFromPairings(state.pairings);

    if (app.allPairingsComplete(state.pairings)) {
      const nextRoundRacers = state.winners.map(function (w) {
        return Object.assign({}, w, { eliminated: false });
      });
      state.currentRound = Number(state.currentRound || 1) + 1;
      state.racers = nextRoundRacers;
      state.pairings = app.generatePairingsFromRacers(nextRoundRacers);
      state.winners = app.winnersFromPairings(state.pairings);
      state.trackStatus = "Pairing";
      state.callToLanesMessage = "Round " + state.currentRound + " pairings are live";
    }
    await persist();
  }

  async function undoWinner(pairId) {
    const pair = state.pairings.find(function (p) { return p.id === pairId; });
    if (!pair || pair.bye) return;
    pair.winnerId = null;
    pair.completed = false;
    state.winners = app.winnersFromPairings(state.pairings);
    await persist();
  }

  document.addEventListener("click", async function (e) {
    const delId = e.target.getAttribute("data-delete-racer");
    if (delId) {
      state.racers = state.racers.filter(function (r) { return r.id !== delId; });
      await persist();
      return;
    }
    const pairId = e.target.getAttribute("data-win");
    if (pairId) {
      await markWinner(pairId, e.target.getAttribute("data-side"));
      return;
    }
    const undoId = e.target.getAttribute("data-undo");
    if (undoId) {
      await undoWinner(undoId);
    }
  });

  window.saveEventSettingsHandler = saveEventSettingsHandler;
  window.pushCallToLanesHandler = pushCallToLanesHandler;
  window.addRacerHandler = addRacerHandler;
  window.loadDemoRacersHandler = loadDemoRacersHandler;
  window.generatePairingsHandler = generatePairingsHandler;
  window.clearRoundHandler = clearRoundHandler;

  if (app.bc) {
    app.bc.onmessage = function () { refreshState(); };
  }
  refreshState();
})();
