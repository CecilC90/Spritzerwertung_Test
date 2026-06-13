const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_AUTH_DOMAIN",
  databaseURL: "https://spritzerwertung-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "spritzerwertung"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let selectedTeamId = localStorage.getItem("selectedTeamId") || null;

function loadTeams() {
  db.ref("teams").once("value", snapshot => {
    const teams = snapshot.val();
    const container = document.getElementById("team-buttons");
    container.innerHTML = "";

    if (!teams) {
      container.innerHTML = "<p>Noch keine Teams vorhanden.</p>";
      return;
    }

    Object.entries(teams).forEach(([id, team]) => {
      const row = document.createElement("div");
      row.className = "team-row";

      const btn = document.createElement("button");
      btn.className = "team-button";
      btn.textContent = team.name;

      if (id === selectedTeamId) {
        btn.classList.add("selected");
      }

      btn.onclick = () => {
        selectedTeamId = id;
        localStorage.setItem("selectedTeamId", id);

        document
          .querySelectorAll(".team-button")
          .forEach(b => b.classList.remove("selected"));

        btn.classList.add("selected");
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-team-button";
      deleteBtn.textContent = "🗑️";

      deleteBtn.onclick = async (event) => {
        event.stopPropagation();

        const sicher = confirm(`Team "${team.name}" wirklich löschen?`);

        if (!sicher) {
          return;
        }

        try {
          await db.ref(`teams/${id}`).remove();

          if (selectedTeamId === id) {
            selectedTeamId = null;
            localStorage.removeItem("selectedTeamId");
          }

          loadTeams();
        } catch (error) {
          console.error(error);
          alert("Fehler beim Löschen des Teams!");
        }
      };

      row.appendChild(btn);
      row.appendChild(deleteBtn);

      container.appendChild(row);
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
      localStorage.setItem("username", username);
      showBooking(username);
    }
  });
});

//Spritzer Buchungen hinzufügen 
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

// Spritzer Buchungen stornieren
document.getElementById("storno-btn").addEventListener("click", async () => {
  const inputCount = parseInt(document.getElementById("spritzer-count").value, 10);
  if (!selectedTeamId || isNaN(inputCount) || inputCount <= 0) {
    alert("Bitte Team wählen und eine gültige Anzahl eingeben!");
    return;
  }
  // 1. aktuellen Stand holen
  const current = await showCurrentCount(selectedTeamId);
  if (current === null) {
    alert("Fehler beim Auslesen des aktuellen Stands.");
    return;
  }

  // 2. prüfen, ob storniert werden kann
  if (current < inputCount) {
    alert("Nicht genügend Buchungen zum Stornieren!");
    return;
  }

  // 3. Transaktion durchführen
  const ref = db.ref(`teams/${selectedTeamId}/count`);
  ref.transaction((prev) => {
    // wir wissen, prev >= inputCount
    return (prev || 0) - inputCount;
  }, (error, committed, snapshot) => {
    if (error) {
      console.error("Transaction fehlgeschlagen:", error);
      alert("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } else if (committed) {
      const newVal = snapshot.val() || 0;
      alert(`Storno erfolgreich! Neuer Stand: ${newVal}`);
    }
  });

  document.getElementById("spritzer-count").value = "";
});
document.getElementById("setValue-btn").addEventListener("click", async () => {
  const input = document.getElementById("spritzer-count");
  const inputCount = parseInt(input.value, 10);

  if (!selectedTeamId) {
    alert("Bitte Team wählen!");
    return;
  }

  if (isNaN(inputCount)) {
    alert("Bitte gültige Zahl eingeben!");
    return;
  }

  try {
    const ref = db.ref(`teams/${selectedTeamId}/count`);

    await ref.set(inputCount);
    alert(`Anzahl auf ${inputCount} gesetzt!`);

    input.value = "";
  } catch (error) {
    console.error(error);
    alert("Fehler beim Speichern!");
  }
});

const teamToast = document.getElementById("team-toast");
const openAddTeamToastBtn = document.getElementById("open-add-team-toast-btn");
const saveTeamBtn = document.getElementById("save-team-btn");
const cancelTeamBtn = document.getElementById("cancel-team-btn");
const newTeamNameInput = document.getElementById("new-team-name");

// Toast öffnen
openAddTeamToastBtn.addEventListener("click", () => {
  newTeamNameInput.value = "";
  teamToast.classList.remove("hidden");
  newTeamNameInput.focus();
});

// Toast schließen
cancelTeamBtn.addEventListener("click", () => {
  teamToast.classList.add("hidden");
});

// Team speichern
saveTeamBtn.addEventListener("click", async () => {
  const teamName = newTeamNameInput.value.trim();

  if (!teamName) {
    alert("Bitte Teamnamen eingeben!");
    return;
  }

  try {
    const newTeamRef = db.ref("teams").push();

    await newTeamRef.set({
      name: teamName,
      count: 0
    });

    newTeamNameInput.value = "";
    teamToast.classList.add("hidden");

    loadTeams();

  } catch (error) {
    console.error(error);
    alert("Fehler beim Hinzufügen des Teams!");
  }
});
// Hilfsfunktion: aktuellen Stand anzeigen
function showCurrentCount(teamId) {
  if (!teamId) {
    console.warn("Kein Team ausgewählt.");
    return Promise.resolve(null);
  }
  return db
    .ref(`teams/${teamId}/count`)
    .once("value")
    .then(snapshot => {
      return snapshot.val() == null ? 0 : snapshot.val();
    })
    .catch(err => {
      console.error("Fehler beim Auslesen des Counts:", err);
      return null;
    });
}


// 🔁 Automatischer Login bei Seitenstart
window.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) {
    db.ref("usernames/" + savedUser).once("value", snapshot => {
      if (snapshot.exists()) {
        showBooking(savedUser);
      } else {
        localStorage.removeItem("username");
        localStorage.removeItem("selectedTeamId");
      }
    });
  }
});

// 👤 Benutzerbereich anzeigen
function showBooking(username) {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("booking-section").classList.remove("hidden");
  document.getElementById("user-label").textContent = username;
  loadTeams();
}
