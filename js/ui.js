/**
 * Initialisiert die gesamte UI und Event-Handler
 */
export function initUI(controls) {
    // DOM-Elemente
    const startBtn = document.getElementById("startBtn");
    const menu = document.getElementById("menu");
    const closeMenuBtn = document.getElementById("closeMenu");
    const info = document.getElementById("info");
    const crosshair = document.getElementById("crosshair");
    const popup = document.getElementById("popup");
    const closePopUpBtn = document.getElementById("closepopup");
    const volumeSlider = document.getElementById("volumeSlider");
    const speedSlider = document.getElementById("speedSlider");
    const carAudio = document.querySelector('#carAudio');
    const brandAudio = document.querySelector('#brandAudio');
    const backgroundAudio = document.querySelector('#backgroundAudio');
    const volumeSlider2 = document.getElementById("volumeSlider2");

    let menuOpen = false;
    let popupOpen = false;
    let crosshairOn = false;

    // === Menüfunktionen ===
    function openMenu() {
        if (menuOpen || popupOpen) return;
        menuOpen = true;
        menu.classList.add("show");
        controls.unlock();
        document.body.style.cursor = "default";
        if (crosshairOn) {
            crosshair.style.display = "none";
            crosshairOn = false;
        }
    }

    function closeMenu() {
        if (!menuOpen) return;
        menuOpen = false;
        menu.classList.remove("show");
        controls.lock();
        document.body.style.cursor = "none";
        if (!crosshairOn) {
            crosshair.style.display = "block";
            crosshairOn = true;
        }
    }

    // === Popup-Funktionen ===
    function openPopup() {
        if (popupOpen) return;
        popupOpen = true;
        popup.classList.add("show");
        controls.unlock();
        document.body.style.cursor = "default";
        crosshair.style.display = crosshairOn ? "none" : "block";
        crosshairOn = !crosshairOn;
    }

    function closePopup() {
        if (!popupOpen) return;
        popupOpen = false;
        popup.classList.remove("show");

        // Audio stoppen
        if (carAudio) {
            carAudio.pause();
            carAudio.currentTime = 0;
        }

        controls.lock();
        document.body.style.cursor = "none";
        if (!crosshairOn) {
            crosshair.style.display = "block";
            crosshairOn = true;
        }
    }

    // === Event Listener ===

    // Startbutton
    startBtn.addEventListener("click", () => {
        controls.lock();
        crosshair.style.display = "block";
        crosshairOn = true;
        backgroundAudio.volume = parseFloat(volumeSlider2.value);
        backgroundAudio.play();
    });

    // PointerLock Events
    controls.addEventListener("lock", () => {
        startBtn.style.display = "none";
        info.style.display = "block";
        document.body.style.cursor = "none";
        menuOpen = false;
        menu.classList.remove("show");
    });

    // I-Taste für Menü/Popup
    window.addEventListener("keydown", (e) => {
        if (e.code !== "KeyI") return;
        if (popupOpen) {
            closePopup();
            return;
        }
        e.preventDefault();
        menuOpen ? closeMenu() : openMenu();
    });

    // Menü schließen Button
    closeMenuBtn.addEventListener("click", closeMenu);

    // Popup schließen Button
    closePopUpBtn.addEventListener("click", closePopup);

    // Volume Slider
    volumeSlider.addEventListener("input", () => {
        const vol = parseFloat(volumeSlider.value);
        console.log("Lautstärke:", vol);

        // car audio lautstärke anpassen
        if (carAudio) {
            carAudio.volume = vol;
        }

        if (brandAudio) {
            brandAudio.volume = vol;
        }
    });

    volumeSlider2.addEventListener("input", () => {
        const vol = parseFloat(volumeSlider2.value);
        console.log("Lautstärke:", vol);

        // car audio lautstärke anpassen
        if (backgroundAudio) {
            backgroundAudio.volume = vol;
        }
    });

    // Speed Slider
    speedSlider.addEventListener("input", () => {
        const speed = parseFloat(speedSlider.value);
        window.setPlayerSpeed(speed);
    });

    return {
        openPopup,
        closePopup,
        isPopupOpen: () => popupOpen
    };
}
