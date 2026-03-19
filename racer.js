
(function () {
  const app = window.RaceApp;
  const mode = "online";

  function byId(id) { return document.getElementById(id); }

  function render(state) {
    const syncStatus = byId("syncStatus");
    if (syncStatus) syncStatus.textContent = app.hasSupabase() ? "Online Mode ✅" : "Local Browser Mode";
    const trackStatus = byId("trackStatus");
    const callText = byId("callToLanesText");
    const pairingBoard = byId("pairingBoard");
    if (trackStatus) trackStatus.textContent = state.trackStatus || "Waiting for updates...";
    if (callText) callText.textContent = state.callToLanesMessage || "No call-to-lanes message yet.";
    if (!pairingBoard) return;
    if (!state.pairings || state.pairings.length === 0) {
      pairingBoard.innerHTML = "Waiting for pairings...";
      return;
    }
    pairingBoard.innerHTML = state.pairings.map(function (p, i) {
      return '<div class="pairing-card"><strong>Pair ' + (i + 1) + '</strong><br/>' +
        (p.left ? p.left.name : "—") + ' vs ' + (p.right ? p.right.name : "BYE") + '</div>';
    }).join("");
  }

  async function refreshState() {
    const state = await app.getState(mode);
    render(state);
  }

  if (app.bc) app.bc.onmessage = function () { refreshState(); };
  refreshState();
  setInterval(refreshState, 2500);
})();
