const AppState = (() => {
  const STORAGE_KEY = 'htown-hitters-race-state-v21';
  const SYNC_MODE_KEY = 'htown-hitters-sync-mode-v21';
  const bc = 'BroadcastChannel' in window ? new BroadcastChannel('htown_hitters_race_sync_v21') : null;

  const fallbackState = {
    eventName: 'H-Town Hitters Race App',
    adminCode: '',
    round: 1,
    status: 'Staging',
    callMessage: '',
    updatedAt: Date.now(),
    racers: [],
    pairings: []
  };

  const uid = () => Math.random().toString(36).slice(2, 10);
  const clone = (v) => JSON.parse(JSON.stringify(v));
  let remoteCache = { ok: null, checkedAt: 0 };

  function normalize(state) {
    const merged = { ...fallbackState, ...(state || {}) };
    merged.racers = Array.isArray(merged.racers) ? merged.racers : [];
    merged.pairings = Array.isArray(merged.pairings) ? merged.pairings : [];
    return merged;
  }

  function getLocalState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(fallbackState);
      return normalize(JSON.parse(raw));
    } catch {
      return clone(fallbackState);
    }
  }

  function setLocalState(state) {
    const next = normalize({ ...state, updatedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (bc) bc.postMessage(next);
    return next;
  }

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function getPreferredSyncMode() {
    const saved = localStorage.getItem(SYNC_MODE_KEY);
    if (saved === 'online' || saved === 'local' || saved === 'auto') return saved;
    if (location.protocol.startsWith('http') && location.hostname.includes('netlify.app')) return 'online';
    return 'auto';
  }

  function setPreferredSyncMode(mode) {
    localStorage.setItem(SYNC_MODE_KEY, mode);
    if (bc) bc.postMessage({ __syncMode: mode });
  }

  async function isRemoteAvailable(force = false) {
    const now = Date.now();
    if (!force && remoteCache.checkedAt && now - remoteCache.checkedAt < 3000) {
      return remoteCache.ok;
    }
    try {
      await fetchJson('/.netlify/functions/race-state');
      remoteCache = { ok: true, checkedAt: now };
      return true;
    } catch {
      remoteCache = { ok: false, checkedAt: now };
      return false;
    }
  }

  async function resolveTransportMode() {
    const preferred = getPreferredSyncMode();
    if (preferred === 'local') {
      return { preferred, actual: 'local', remoteAvailable: false };
    }
    const remoteAvailable = await isRemoteAvailable();
    if (preferred === 'online') {
      return { preferred, actual: remoteAvailable ? 'online' : 'local', remoteAvailable };
    }
    return { preferred, actual: remoteAvailable ? 'online' : 'local', remoteAvailable };
  }

  async function getState() {
    const mode = await resolveTransportMode();
    if (mode.actual === 'online') {
      const data = await fetchJson('/.netlify/functions/race-state');
      return normalize(data.state);
    }
    return getLocalState();
  }

  async function setState(nextState) {
    const normalized = normalize({ ...nextState, updatedAt: Date.now() });
    const mode = await resolveTransportMode();
    if (mode.actual === 'online') {
      const data = await fetchJson('/.netlify/functions/race-state', {
        method: 'POST',
        body: JSON.stringify({ state: normalized })
      });
      if (bc) bc.postMessage(normalized);
      return normalize(data.state);
    }
    return setLocalState(normalized);
  }

  async function updateState(mutator) {
    const current = await getState();
    const next = await mutator(clone(current));
    return setState(next);
  }

  function listen(listener) {
    if (bc) {
      bc.onmessage = (event) => {
        if (event.data?.__syncMode) {
          listener({ type: 'sync-mode', mode: event.data.__syncMode });
          return;
        }
        listener(normalize(event.data));
      };
    }
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        listener(normalize(JSON.parse(event.newValue)));
      }
      if (event.key === SYNC_MODE_KEY && event.newValue) {
        listener({ type: 'sync-mode', mode: event.newValue });
      }
    });
  }

  function makeRacer(payload) {
    return {
      id: uid(),
      racerName: payload.racerName?.trim() || 'Unnamed Racer',
      carName: payload.carName?.trim() || 'Race Car',
      carNumber: payload.carNumber?.trim() || '',
      carImage: payload.carImage?.trim() || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      hadBye: false,
      active: true
    };
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildPairings(racers) {
    const active = racers.filter((r) => r.active !== false);
    if (active.length < 2) return [];

    let pool = shuffle(active);
    const pairings = [];

    if (pool.length % 2 === 1) {
      const eligible = pool.filter((r) => !r.hadBye);
      const byePool = eligible.length ? eligible : pool;
      const byeWinner = byePool[Math.floor(Math.random() * byePool.length)];
      pairings.push({
        id: uid(),
        type: 'bye',
        lane: 'BYE',
        racer1: byeWinner,
        racer2: null,
        winnerId: byeWinner.id
      });
      pool = pool.filter((r) => r.id !== byeWinner.id);
    }

    pool = shuffle(pool);
    for (let i = 0; i < pool.length; i += 2) {
      const racer1 = pool[i];
      const racer2 = pool[i + 1];
      const lanePattern = Math.random() > 0.5 ? ['Left', 'Right'] : ['Right', 'Left'];
      pairings.push({
        id: uid(),
        type: 'match',
        racer1,
        racer2,
        lanes: [
          { racerId: racer1.id, lane: lanePattern[0] },
          { racerId: racer2.id, lane: lanePattern[1] }
        ],
        winnerId: null
      });
    }

    return pairings;
  }

  async function seedDemoData() {
    return updateState((state) => {
      if (state.racers.length) return state;
      const demo = [
        ['Kareem Browne', 'Lt. Dan', '007'],
        ['Trey Mason', 'Warpath', '119'],
        ['Chris Hall', 'Black Mamba', '222'],
        ['Jalen Carter', 'Pressure', '455'],
        ['Mike Reed', 'No Lift', '808'],
        ['Derrick Owens', 'Street Heat', '510'],
        ['Cam Jones', 'Boost Mode', '317']
      ].map(([racerName, carName, carNumber], i) => makeRacer({
        racerName,
        carName,
        carNumber,
        carImage: `https://picsum.photos/seed/htown${i}/800/500`
      }));
      state.racers = demo;
      return state;
    });
  }

  return {
    uid,
    getState,
    setState,
    updateState,
    listen,
    makeRacer,
    buildPairings,
    seedDemoData,
    isRemoteAvailable,
    getPreferredSyncMode,
    setPreferredSyncMode,
    resolveTransportMode
  };
})();


// ---- Supabase Online Patch ----
function __getSupabaseClient() {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey || !window.supabase || !window.supabase.createClient) return null;
  if (!window.__HTH_SUPABASE__) {
    window.__HTH_SUPABASE__ = window.supabase.createClient(cfg.url, cfg.anonKey);
  }
  return window.__HTH_SUPABASE__;
}

fetchOnlineState = async function() {
  const client = __getSupabaseClient();
  const cfg = window.SUPABASE_CONFIG;
  if (!client || !cfg) throw new Error("Supabase not configured");
  const { data, error } = await client
    .from(cfg.table || "race_state")
    .select("payload")
    .eq("id", cfg.rowId || 1)
    .single();
  if (error) throw error;
  return data?.payload || {};
};

saveOnlineState = async function(state) {
  const client = __getSupabaseClient();
  const cfg = window.SUPABASE_CONFIG;
  if (!client || !cfg) throw new Error("Supabase not configured");
  const payload = {
    id: cfg.rowId || 1,
    payload: state,
    updated_at: new Date().toISOString()
  };
  const { error } = await client
    .from(cfg.table || "race_state")
    .upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return { success: true };
};

detectOnlineAvailable = async function() {
  try {
    const client = __getSupabaseClient();
    const cfg = window.SUPABASE_CONFIG;
    if (!client || !cfg) return false;
    const { error } = await client
      .from(cfg.table || "race_state")
      .select("id")
      .eq("id", cfg.rowId || 1)
      .single();
    return !error;
  } catch {
    return false;
  }
};
