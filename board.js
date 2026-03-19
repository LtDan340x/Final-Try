
(function () {
  const app = window.RaceApp;
  const mode = "online";

  function byId(id) { return document.getElementById(id); }

  function render(state) {
    const syncStatus = byId("syncStatus");
    if (syncStatus) syncStatus.textContent = app.hasSupabase() ? "Online Mode ✅" : "Local Browser Mode";
    const status = byId("boardTrackStatus");
    const call = byId("boardCallMessage");
    const pairings = byId("boardPairings");
    if (status) status.textContent = state.trackStatus || "Waiting for updates...";
    if (call) call.textContent = state.callToLanesMessage || "No active call-to-lanes message.";
    if (!pairings) return;
    if (!state.pairings || state.pairings.length === 0) {
      pairings.innerHTML = "Waiting for pairings...";
      return;
    }
    pairings.innerHTML = state.pairings.map(function (p, i) {
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
