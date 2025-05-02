const firebaseConfig = {
    apiKey: "DEIN_API_KEY",
    authDomain: "DEIN_AUTH_DOMAIN",
    databaseURL: "https://spritzerwertung-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "spritzerwertung",
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  function renderLeaderboard() {
    const container = document.getElementById("leaderboard");
  
    db.ref("teams").on("value", snapshot => {
      const teams = snapshot.val();
  
      // Die Teams nach Anzahl der Spritzer absteigend sortieren
      const sorted = Object.entries(teams).sort((a, b) => b[1].count - a[1].count);
  
      container.innerHTML = "";  // Vorherige Einträge löschen
  
      // Berechne den maximalen Wert (um die Breite der Balken zu normalisieren)
      const maxCount = Math.max(...Object.values(teams).map(team => team.count));
  
      sorted.forEach(([id, team]) => {
        // Erstellen eines neuen Team-Elements
        const teamDiv = document.createElement("div");
        teamDiv.className = "team";
  
        // Erstellen des Balkens
        const barContainer = document.createElement("div");
        barContainer.className = "bar-container";
  
        const bar = document.createElement("div");
        bar.className = "bar";
  
        // Berechne die Breite des Balkens basierend auf der Anzahl der Spritzer
        const width = (team.count / maxCount) * 100;  // Berechnung der Breite in Prozent
        bar.style.width = `${width}%`;  // Setzen der Breite des Balkens
  
        // Label für das Team und die Anzahl der Spritzer
        const barLabel = document.createElement("span");
        barLabel.className = "bar-label";
        barLabel.textContent = `${team.name}: ${team.count || 0} Spritzer`;
  
        // Die Balken und Label in den Container einfügen
        barContainer.appendChild(bar);
        barContainer.appendChild(barLabel);
        teamDiv.appendChild(barContainer);
  
        // Füge das Team-Element dem Container hinzu
        container.appendChild(teamDiv);
      });
    });
  }
  
  // Funktion aufrufen, um das Leaderboard zu rendern
  renderLeaderboard();
  