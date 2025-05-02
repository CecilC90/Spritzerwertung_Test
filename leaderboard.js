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
    if (!teams) return;

    const sorted = Object.entries(teams).sort((a, b) => b[1].count - a[1].count);
    const maxCount = Math.max(...Object.values(teams).map(team => team.count || 0));

    container.innerHTML = "";

    sorted.forEach(([id, team]) => {
      const teamDiv = document.createElement("div");
      teamDiv.className = "team";

      // Linker Teil (Name + Anzahl)
      const infoDiv = document.createElement("div");
      infoDiv.className = "team-info";

      const nameDiv = document.createElement("div");
      nameDiv.className = "team-name";
      nameDiv.textContent = team.name;

      const countDiv = document.createElement("div");
      countDiv.className = "team-count";
      countDiv.textContent = `${team.count || 0} Spritzer`;

      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(countDiv);

      // Rechter Teil (Balken)
      const barContainer = document.createElement("div");
      barContainer.className = "bar-container";

      const bar = document.createElement("div");
      bar.className = "bar";
      const width = (team.count / maxCount) * 100;
      bar.style.width = `${width}%`;

      barContainer.appendChild(bar);
      teamDiv.appendChild(infoDiv);
      teamDiv.appendChild(barContainer);
      container.appendChild(teamDiv);
    });
  });
}

renderLeaderboard();
