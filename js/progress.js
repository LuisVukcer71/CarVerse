import * as THREE from "https://esm.sh/three@0.160.0";

const MUSEUM_ZONES = [
  // Ferrari-Bereich (vorne)
  {
    id: "ferrari_front_1",
    name: "Ferrari Galerie 1",
    brand: "Ferrari",
    bounds: { minX: -20, maxX: -6, minZ: -120, maxZ: -100 },
  },
  {
    id: "ferrari_front_2",
    name: "Ferrari Galerie 2",
    brand: "Ferrari",
    bounds: { minX: 6, maxX: 20, minZ: -120, maxZ: -100 },
  },
  {
    id: "ferrari_front_3",
    name: "Ferrari Galerie 3",
    brand: "Ferrari",
    bounds: { minX: -20, maxX: 20, minZ: -100, maxZ: -60 },
  },

  // Tesla-Bereich (links)
  {
    id: "tesla_left_1",
    name: "Tesla Galerie 1",
    brand: "Tesla",
    bounds: { minX: -120, maxX: -100, minZ: -20, maxZ: 20 },
  },
  {
    id: "tesla_left_2",
    name: "Tesla Galerie 2",
    brand: "Tesla",
    bounds: { minX: -100, maxX: -80, minZ: -20, maxZ: 20 },
  },
  {
    id: "tesla_left_3",
    name: "Tesla Galerie 3",
    brand: "Tesla",
    bounds: { minX: -80, maxX: -60, minZ: -20, maxZ: 20 },
  },

  // Porsche-Bereich (hinten)
  {
    id: "porsche_back_1",
    name: "Porsche Galerie 1",
    brand: "Porsche",
    bounds: { minX: -20, maxX: 20, minZ: 100, maxZ: 120 },
  },
  {
    id: "porsche_back_2",
    name: "Porsche Galerie 2",
    brand: "Porsche",
    bounds: { minX: -20, maxX: 20, minZ: 80, maxZ: 100 },
  },
  {
    id: "porsche_back_3",
    name: "Porsche Galerie 3",
    brand: "Porsche",
    bounds: { minX: -20, maxX: 20, minZ: 60, maxZ: 80 },
  },

  // BMW-Bereich (rechts)
  {
    id: "bmw_right_1",
    name: "BMW Galerie 1",
    brand: "BMW",
    bounds: { minX: 100, maxX: 120, minZ: -20, maxZ: 20 },
  },
  {
    id: "bmw_right_2",
    name: "BMW Galerie 2",
    brand: "BMW",
    bounds: { minX: 80, maxX: 100, minZ: -20, maxZ: 20 },
  },
  {
    id: "bmw_right_3",
    name: "BMW Galerie 3",
    brand: "BMW",
    bounds: { minX: 60, maxX: 80, minZ: -20, maxZ: 20 },
  },

  // Zentrum
  {
    id: "center",
    name: "Zentrale Halle",
    brand: "Center",
    bounds: { minX: -30, maxX: 30, minZ: -30, maxZ: 30 },
  },
];


class ProgressTracker {
  constructor() {
    this.exploredZones = new Set();
    this.currentZone = null;
    this.listeners = [];
    this.loadProgress();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem("carverse_progress");
      if (saved) {
        const data = JSON.parse(saved);
        this.exploredZones = new Set(data.exploredZones || []);
        console.log(
          `✓ Fortschritt geladen: ${this.exploredZones.size} von ${MUSEUM_ZONES.length} Bereichen erkundet`
        );
      }
    } catch (error) {
      console.error("Fehler beim Laden des Fortschritts:", error);
    }
  }

  saveProgress() {
    try {
      const data = {
        exploredZones: Array.from(this.exploredZones),
        lastUpdate: Date.now(),
      };
      localStorage.setItem("carverse_progress", JSON.stringify(data));
    } catch (error) {
      console.error("Fehler beim Speichern des Fortschritts:", error);
    }
  }

  checkPosition(position) {
    const x = position.x;
    const z = position.z;

    for (const zone of MUSEUM_ZONES) {
      const { minX, maxX, minZ, maxZ } = zone.bounds;

      if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
        if (!this.exploredZones.has(zone.id)) {
          this.markZoneExplored(zone);
        }

        if (this.currentZone !== zone.id) {
          this.currentZone = zone.id;
        }

        return zone;
      }
    }

    this.currentZone = null;
    return null;
  }

  markZoneExplored(zone) {
    this.exploredZones.add(zone.id);
    this.saveProgress();
    this.notifyProgressUpdate();
    console.log(
      `🎯 Neue Zone erkundet: ${zone.name} (${this.getProgressPercentage()}%)`
    );
  }

  getProgressPercentage() {
    return Math.round((this.exploredZones.size / MUSEUM_ZONES.length) * 100);
  }

  getExploredCount() {
    return this.exploredZones.size;
  }

  getTotalZones() {
    return MUSEUM_ZONES.length;
  }

  getProgressDetails() {
    const brandProgress = {};

    for (const zone of MUSEUM_ZONES) {
      if (!brandProgress[zone.brand]) {
        brandProgress[zone.brand] = { total: 0, explored: 0 };
      }
      brandProgress[zone.brand].total++;
      if (this.exploredZones.has(zone.id)) {
        brandProgress[zone.brand].explored++;
      }
    }

    return {
      percentage: this.getProgressPercentage(),
      explored: this.exploredZones.size,
      total: MUSEUM_ZONES.length,
      byBrand: brandProgress,
    };
  }

  onProgressUpdate(callback) {
    this.listeners.push(callback);
  }

  notifyProgressUpdate() {
    const details = this.getProgressDetails();
    this.listeners.forEach((callback) => callback(details));
  }

  reset() {
    this.exploredZones.clear();
    this.currentZone = null;
    this.saveProgress();
    this.notifyProgressUpdate();
    console.log("🔄 Fortschritt wurde zurückgesetzt");
  }
}

export function initProgress(camera) {
  const tracker = new ProgressTracker();

  function updateProgress() {
    tracker.checkPosition(camera.position);
  }

  return {
    update: updateProgress,
    tracker: tracker,
    getProgress: () => tracker.getProgressDetails(),
    reset: () => tracker.reset(),
    onUpdate: (callback) => tracker.onProgressUpdate(callback),
  };
}
