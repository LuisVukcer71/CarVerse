export class ProgressUI {
  constructor(progressAPI, controls) {
    this.progressAPI = progressAPI;
    this.controls = controls;
    this.popupOpen = false;

    this.createUI();
    this.setupEventListeners();
    this.updateDisplay();

    // Listener für Fortschritts-Updates
    progressAPI.onUpdate((details) => this.updateDisplay(details));

    console.log("✅ Progress System bereit - Drücke P zum Öffnen");
  }

  createUI() {
    // Progress Popup (ähnlich wie #menu und #popup)
    const progressPopup = document.createElement("div");
    progressPopup.id = "progressPopup";
    progressPopup.innerHTML = `
      <button id="closeProgressPopup">✕</button>
      <h2>🗺️ Erkundungsfortschritt</h2>

      <div class="progress-circle-small">
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle class="progress-bg-circle" cx="50" cy="50" r="45" />
          <circle class="progress-fill-circle" cx="50" cy="50" r="45" id="progress-circle-svg" />
        </svg>
        <div class="progress-center-text">
          <span id="progress-percent-text">0%</span>
        </div>
      </div>

      <p><strong>Bereiche erkundet:</strong> <span id="progress-zones">0 / 13</span></p>

      <hr style="margin: 20px 0; opacity: 0.3;" />

      <div id="brand-list"></div>

      <hr style="margin: 20px 0; opacity: 0.3;" />

      <button id="reset-progress-btn" style="
        width: 100%;
        padding: 10px;
        background: rgba(255, 85, 85, 0.2);
        border: 1px solid rgba(255, 85, 85, 0.5);
        color: #ff5555;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 10px;
      ">
        🔄 Fortschritt zurücksetzen
      </button>

      <p style="font-size:14px; opacity:0.8; margin-top: 15px;">Drücke P, um zu schließen</p>
    `;

    document.body.appendChild(progressPopup);
    console.log("✓ Progress Popup erstellt");
  }

  setupEventListeners() {
    const popup = document.getElementById("progressPopup");
    const closeBtn = document.getElementById("closeProgressPopup");
    const resetBtn = document.getElementById("reset-progress-btn");

    // Schließen-Button
    closeBtn.addEventListener("click", () => this.closePopup());

    // P-Taste zum Öffnen/Schließen - globaler Listener mit Prevention
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.code === "KeyP" && !e.repeat) {
          e.preventDefault();
          e.stopPropagation();
          this.togglePopup();
        }
      },
      true
    );

    // Reset-Button
    resetBtn.addEventListener("click", () => {
      if (
        confirm(
          "Möchtest du deinen gesamten Fortschritt wirklich zurücksetzen?"
        )
      ) {
        this.progressAPI.reset();
      }
    });

    console.log("✓ Event Listeners aktiviert");
  }

  openPopup() {
    if (this.popupOpen) return;

    const popup = document.getElementById("progressPopup");
    popup.classList.add("show");
    this.popupOpen = true;

    // Pointer Lock freigeben
    this.controls.unlock();
    document.body.style.cursor = "default";

    // Crosshair verstecken
    const crosshair = document.getElementById("crosshair");
    if (crosshair) crosshair.style.display = "none";

    // Aktualisiere Anzeige
    this.updateDisplay();

    console.log("📖 Progress Popup geöffnet");
  }

  closePopup() {
    if (!this.popupOpen) return;

    const popup = document.getElementById("progressPopup");
    popup.classList.remove("show");
    this.popupOpen = false;

    // Pointer Lock wieder aktivieren
    this.controls.lock();
    document.body.style.cursor = "none";

    // Crosshair wieder anzeigen
    const crosshair = document.getElementById("crosshair");
    if (crosshair) crosshair.style.display = "block";

    console.log("📕 Progress Popup geschlossen");
  }

  togglePopup() {
    if (this.popupOpen) {
      this.closePopup();
    } else {
      this.openPopup();
    }
  }

  updateDisplay(details = null) {
    const data = details || this.progressAPI.getProgress();

    // Prozentanzeige
    const percentEl = document.getElementById("progress-percent-text");
    if (percentEl) percentEl.textContent = `${data.percentage}%`;

    // Zonen-Zähler
    const zonesEl = document.getElementById("progress-zones");
    if (zonesEl) zonesEl.textContent = `${data.explored} / ${data.total}`;

    // SVG Kreis aktualisieren
    const circle = document.getElementById("progress-circle-svg");
    if (circle) {
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (data.percentage / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }

    // Marken-Liste
    this.updateBrandList(data.byBrand);
  }

  updateBrandList(brandData) {
    const container = document.getElementById("brand-list");
    if (!container) return;

    const brandIcons = {
      Ferrari: "🏎️",
      Tesla: "⚡",
      Porsche: "🏁",
      BMW: "🔷",
      Center: "🏛️",
    };

    let html = "";
    for (const [brand, stats] of Object.entries(brandData)) {
      const percentage = Math.round((stats.explored / stats.total) * 100);
      const filled = "█".repeat(Math.floor(percentage / 25));
      const empty = "░".repeat(4 - Math.floor(percentage / 25));

      html += `
        <p style="margin: 8px 0;">
          <strong>${brandIcons[brand] || "🚗"} ${brand}:</strong>
          ${percentage}% ${filled}${empty} (${stats.explored}/${stats.total})
        </p>
      `;
    }

    container.innerHTML = html;
  }
}

export function initProgressUI(progressAPI, controls) {
  return new ProgressUI(progressAPI, controls);
}
