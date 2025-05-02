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
      const sorted = Object.entries(teams).sort((a, b) => b[1].count - a[1].count);
  
      container.innerHTML = "";
      sorted.forEach(([id, team]) => {
        const div = document.createElement("div");
        div.className = "team";
        div.innerHTML = `<strong>${team.name}</strong> <span>${team.count || 0} Spritzer</span>;
        container.appendChild(div);
        `
      });
    });
  }
  
  renderLeaderboard();