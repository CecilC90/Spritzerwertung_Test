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

    const prevRects = {};
    Array.from(container.children).forEach(el => {
      prevRects[el.dataset.id] = el.getBoundingClientRect();
    });

    const newElements = {};
    sorted.forEach(([id, team]) => {
      let teamDiv = container.querySelector(`[data-id="${id}"]`);
      const isNew = !teamDiv;

      if (isNew) {
        teamDiv = document.createElement("div");
        teamDiv.className = "team";
        teamDiv.dataset.id = id;

        const infoDiv = document.createElement("div");
        infoDiv.className = "team-info";

        const nameDiv = document.createElement("div");
        nameDiv.className = "team-name";
        infoDiv.appendChild(nameDiv);

        const countDiv = document.createElement("div");
        countDiv.className = "team-count";
        infoDiv.appendChild(countDiv);

        const barContainer = document.createElement("div");
        barContainer.className = "bar-container";

        const bar = document.createElement("div");
        bar.className = "bar";
        barContainer.appendChild(bar);

        teamDiv.appendChild(infoDiv);
        teamDiv.appendChild(barContainer);
      }

      teamDiv.querySelector(".team-name").textContent = team.name;
      teamDiv.querySelector(".team-count").textContent = `${team.count || 0} Spritzer`;
      const width = (team.count / maxCount) * 100;
      teamDiv.querySelector(".bar").style.width = `${width}%`;

      newElements[id] = teamDiv;
    });

    // Neue Reihenfolge setzen
    const fragment = document.createDocumentFragment();
    sorted.forEach(([id]) => {
      fragment.appendChild(newElements[id]);
    });

    container.innerHTML = "";
    container.appendChild(fragment);

    // FLIP Animation anwenden
    requestAnimationFrame(() => {
      Object.entries(newElements).forEach(([id, el]) => {
        const old = prevRects[id];
        if (!old) return;
        const newRect = el.getBoundingClientRect();

        const dx = old.left - newRect.left;
        const dy = old.top - newRect.top;

        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = "none";

        requestAnimationFrame(() => {
          el.style.transition = "transform 0.5s ease";
          el.style.transform = "";
        });
      });
    });
  });
}

renderLeaderboard();
