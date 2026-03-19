
(function (global) {
  const STORAGE_KEY = "htx_race_state_v22_supabase";
  const CHANNEL_NAME = "htx_race_channel_v22_supabase";
  const DEFAULT_STATE = {
    eventName: "H-Town Hitters Race App",
    currentRound: 1,
    trackStatus: "Pairing",
    callToLanesMessage: "Round 1 pairings are live",
    racers: [],
    pairings: [],
    winners: [],
    updatedAt: null
  };
  const bc = ("BroadcastChannel" in window) ? new BroadcastChannel(CHANNEL_NAME) : null;

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function normalize(state) {
    const next = Object.assign({}, clone(DEFAULT_STATE), state || {});
    if (!Array.isArray(next.racers)) next.racers = [];
    if (!Array.isArray(next.pairings)) next.pairings = [];
    if (!Array.isArray(next.winners)) next.winners = [];
    return next;
  }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function getLocalState() {
    try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")); }
    catch { return clone(DEFAULT_STATE); }
  }
  function setLocalState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(state))); }

  function hasSupabase() {
    return !!(global.SUPABASE_CONFIG && global.SUPABASE_CONFIG.url && global.SUPABASE_CONFIG.anonKey && global.supabase && global.supabase.createClient);
  }

  let supabaseClient = null;
  function getSupabaseClient() {
    if (!hasSupabase()) return null;
    if (!supabaseClient) {
      supabaseClient = global.supabase.createClient(global.SUPABASE_CONFIG.url, global.SUPABASE_CONFIG.anonKey);
    }
    return supabaseClient;
  }

  async function fetchRemoteState() {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured");
    const table = global.SUPABASE_CONFIG.table || "race_state";
    const rowId = global.SUPABASE_CONFIG.rowId || 1;
    const { data, error } = await client.from(table).select("payload").eq("id", rowId).single();
    if (error) throw error;
    return normalize((data && data.payload) || {});
  }

  async function saveRemoteState(state) {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured");
    const table = global.SUPABASE_CONFIG.table || "race_state";
    const rowId = global.SUPABASE_CONFIG.rowId || 1;
    const payload = normalize(state);
    payload.updatedAt = new Date().toISOString();
    const { error } = await client.from(table).upsert({
      id: rowId,
      payload: payload,
      updated_at: payload.updatedAt
    }, { onConflict: "id" });
    if (error) throw error;
    if (bc) bc.postMessage({ type: "state-changed" });
    return payload;
  }

  async function getState(mode) {
    if (mode === "local") return getLocalState();
    if (mode === "online") return await fetchRemoteState();
    if (hasSupabase()) {
      try { return await fetchRemoteState(); }
      catch { return getLocalState(); }
    }
    return getLocalState();
  }

  async function saveState(state, mode) {
    if (mode === "online" && hasSupabase()) return await saveRemoteState(state);
    const payload = normalize(state);
    payload.updatedAt = new Date().toISOString();
    setLocalState(payload);
    if (bc) bc.postMessage({ type: "state-changed" });
    return payload;
  }

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function generatePairingsFromRacers(racers) {
    const shuffled = shuffle(racers.filter(r => !r.eliminated));
    const out = [];
    while (shuffled.length > 1) {
      const left = shuffled.shift();
      const right = shuffled.shift();
      out.push({ id: uid(), left, right, winnerId: null, completed: false });
    }
    if (shuffled.length === 1) {
      const bye = shuffled.shift();
      out.push({ id: uid(), left: bye, right: null, winnerId: bye.id, completed: true, bye: true });
    }
    return out;
  }

  function allPairingsComplete(pairings) {
    return pairings.length > 0 && pairings.every(p => p.completed);
  }

  function winnersFromPairings(pairings) {
    return pairings.filter(p => p.winnerId).map(p => {
      if (p.left && p.left.id === p.winnerId) return p.left;
      if (p.right && p.right.id === p.winnerId) return p.right;
      return null;
    }).filter(Boolean);
  }

  global.RaceApp = {
    DEFAULT_STATE, clone, normalize, uid, getLocalState, setLocalState,
    hasSupabase, getState, saveState, generatePairingsFromRacers,
    allPairingsComplete, winnersFromPairings, bc
  };
})(window);
