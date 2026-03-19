<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>H-Town Hitters Race App - Admin</title>
  <link rel="stylesheet" href="styles.css" />
  <script src="supabase-config.js"></script>
</head>
<body>
  <div class="app-shell">
    <aside class="side-panel glass">
      <div class="brand-block">
        <div class="brand-kicker">B STYLE</div>
        <h1>H-Town Hitters</h1>
        <p>Race Control</p>
      </div>

      <nav class="nav-stack">
        <a class="nav-link active" href="admin.html">Admin</a>
        <a class="nav-link" href="racer.html">Racer View</a>
        <a class="nav-link" href="board.html">MultiView Board</a>
        <a class="nav-link" href="index.html">Home</a>
      </nav>

      <div class="sync-box">
        <h4>SYNC MODE</h4>
        <p id="syncStatus">Checking...</p>
      </div>

      <div class="share-box">
        <h4>SHARE LINK</h4>
        <p>https://htxhitters.netlify.app/admin.html</p>
      </div>
    </aside>

    <main class="main-panel">
      <h2>Round Manager</h2>

      <div class="card">
        <h3>Event Setup</h3>

        <label for="eventName">Event Name</label>
        <input id="eventName" value="H-Town Hitters Race App" />

        <label for="currentRound">Current Round</label>
        <input id="currentRound" type="number" value="1" />

        <label for="trackStatus">Track Status</label>
        <select id="trackStatus">
          <option value="Pairing">Pairing</option>
          <option value="Staging">Staging</option>
          <option value="Call To Lanes">Call To Lanes</option>
          <option value="Completed">Completed</option>
        </select>

        <button onclick="saveEventSettings()">Save Event Settings</button>
        <button onclick="pushCallToLanes()">Push Call To Lanes</button>

        <label for="callToLanesMessage">Call-to-Lanes Message</label>
        <input id="callToLanesMessage" value="Round 1 pairings are live" />
      </div>

      <div class="card">
        <h3>Add Racer</h3>

        <label for="racerName">Racer Name</label>
        <input id="racerName" placeholder="Racer Name" />

        <label for="carName">Car Name</label>
        <input id="carName" placeholder="Car Name" />

        <label for="carNumber">Car Number</label>
        <input id="carNumber" placeholder="#007" />

        <label for="carImageUrl">Car Image URL</label>
        <input id="carImageUrl" placeholder="https://..." />

        <button onclick="addRacer()">Add Racer</button>
        <button onclick="loadDemoRacers()">Load Demo Racers</button>
      </div>

      <div class="card">
        <h3>Racers</h3>
        <div id="racersList">No racers yet.</div>
      </div>

      <div class="card">
        <h3>Round Actions</h3>
        <button onclick="generatePairings()">Generate Pairings</button>
        <button onclick="clearRound()">Clear Round</button>
        <div id="pairingsList">No pairings yet.</div>
      </div>
    </main>
  </div>

  <script src="admin.js"></script>
  <script>
    const syncStatus = document.getElementById("syncStatus");
    if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
      syncStatus.innerText = "Online Mode ✅";
    } else {
      syncStatus.innerText = "Local Browser Mode";
    }

    function saveEventSettings() {
      if (typeof window.saveEventSettingsHandler === "function") {
        window.saveEventSettingsHandler();
      }
    }

    function pushCallToLanes() {
      if (typeof window.pushCallToLanesHandler === "function") {
        window.pushCallToLanesHandler();
      }
    }

    function addRacer() {
      if (typeof window.addRacerHandler === "function") {
        window.addRacerHandler();
      }
    }

    function loadDemoRacers() {
      if (typeof window.loadDemoRacersHandler === "function") {
        window.loadDemoRacersHandler();
      }
    }

    function generatePairings() {
      if (typeof window.generatePairingsHandler === "function") {
        window.generatePairingsHandler();
      }
    }

    function clearRound() {
      if (typeof window.clearRoundHandler === "function") {
        window.clearRoundHandler();
      }
    }
  </script>
</body>
</html>
