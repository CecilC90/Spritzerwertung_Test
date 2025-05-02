const firebaseConfig = {
    apiKey: "DEIN_API_KEY",
    authDomain: "DEIN_AUTH_DOMAIN",
    databaseURL: "https://spritzerwertung-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "spritzerwertung"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  let selectedTeamId = null;

  function loadTeams() {
    db.ref("teams").once("value", snapshot => {
      const teams = snapshot.val();
      const container = document.getElementById("team-buttons");
      container.innerHTML = "";

      Object.entries(teams).forEach(([id, team]) => {
        const btn = document.createElement("button");
        btn.className = "team-button";
        btn.textContent = team.name;
        btn.onclick = () => {
          selectedTeamId = id;
          document.querySelectorAll(".team-button").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        };
        container.appendChild(btn);
      });
    });
  }

  document.getElementById("login-btn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    db.ref("usernames/" + username).once("value", snapshot => {
      const user = snapshot.val();
      if (!user || user.password !== password) {
        alert("Login fehlgeschlagen!");
      } else {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("booking-section").classList.remove("hidden");
        document.getElementById("user-label").textContent = username;
        loadTeams();
      }
    });
  });

  document.getElementById("add-btn").addEventListener("click", () => {
    const count = parseInt(document.getElementById("spritzer-count").value, 10);
    if (!selectedTeamId || isNaN(count) || count <= 0) {
      alert("Bitte Team wählen und Anzahl eingeben!");
      return;
    }

    const ref = db.ref(`teams/${selectedTeamId}/count`);
    ref.transaction(current => (current || 0) + count);
    document.getElementById("spritzer-count").value = "";
  });