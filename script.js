/* ===========================================================
   The Nameless Chronicle — Book Edition Interactive Script
   Version 10.3 | Author: Vaelin Thorne (DM)
   ===========================================================
   Features:
   - 3D Book Page Flip System
   - Rune Unlocks and Magical Seals
   - Hidden Easter Eggs & Secret Names
   - Ambient Sound, Scare Effects, Page Turns
   - Dynamic Entry Loading System
   =========================================================== */

(() => {
  "use strict";

  // === GLOBAL STATE ===
  const Chronicle = {
    currentPage: 0,
    pages: [],
    flipped: new Set(),
    ambient: null,
    locked: {},
    attempts: 0,
    sealsUnlocked: 0,
    totalSeals: 6,
    isAllUnlocked: false,
    book: document.getElementById("chronicleBook"),
    whisperChance: 0.025,
  };

  // === SOUND MANAGEMENT ===
  const Sound = {
    playAmbient() {
      if (Chronicle.ambient) return;
      const amb = new Audio("assets/sounds/ambient_torch.mp3");
      amb.loop = true;
      amb.volume = 0.25;
      amb.play().catch(() => {});
      Chronicle.ambient = amb;
    },

    play(file, volume = 1.0) {
      const s = new Audio(file);
      s.volume = volume;
      s.play().catch(() => {});
    },

    whisper() {
      this.play("assets/sounds/creepy-whispering-6690.mp3", 0.4);
    },

    sealCrack() {
      this.play("assets/sounds/fire-effect-367659.mp3", 0.5);
    },

    pageTurn() {
      this.play("assets/sounds/page_turn.mp3", 0.5);
    },
  };

  // === PAGE SYSTEM ===
  function initBook() {
    Chronicle.pages = document.querySelectorAll(".page");
    Chronicle.pages.forEach((page, index) => {
      page.style.zIndex = Chronicle.pages.length - index;
      page.dataset.pageIndex = index;
      page.addEventListener("click", () => togglePage(index));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    });
  }

  function togglePage(index) {
    if (Chronicle.flipped.has(index)) {
      Chronicle.flipped.delete(index);
      Chronicle.pages[index].classList.remove("open");
      Chronicle.currentPage--;
      Sound.pageTurn();
    } else {
      Chronicle.flipped.add(index);
      Chronicle.pages[index].classList.add("open");
      Chronicle.currentPage++;
      Sound.pageTurn();
    }
  }

  function nextPage() {
    if (Chronicle.currentPage < Chronicle.pages.length - 1)
      togglePage(Chronicle.currentPage);
  }

  function prevPage() {
    if (Chronicle.currentPage > 0)
      togglePage(Chronicle.currentPage - 1);
  }

  // === RUNE UNLOCK SYSTEM ===
  const RUNE_MAP = {
    OCEANUS: ["plane_water_1.html", "plane_water_2.html", "plane_water_3.html"],
    DAWNFALL: ["plane_air_1.html", "plane_air_2.html", "plane_air_3.html"],
    AURIC: ["plane_fire_1.html", "plane_fire_2.html", "plane_fire_3.html"],
    ABYSSAL: ["plane_abyss_1.html", "plane_abyss_2.html"],
    ASTRAEL: ["god_astrael_dream.html", "god_astrael_corrupt.html"],
    STORMCROWN: ["secret_stormvault.html"],
  };

  function attemptRune() {
    const input = document.getElementById("runeInput");
    const val = (input.value || "").toUpperCase().trim();
    if (!val) return;

    if (val === "VAELINTHORNE") {
      unlockAll();
      showSeal(true);
      input.value = "";
      return;
    }

    if (RUNE_MAP[val]) {
      unlockEntries(RUNE_MAP[val]);
      showSeal();
    } else {
      Chronicle.attempts++;
      triggerScare();
      if (Chronicle.attempts >= 3) {
        lockBook();
      }
    }

    input.value = "";
  }

  function unlockEntries(files) {
    files.forEach((file) => {
      localStorage.setItem("u_" + file, "1");
    });
  }

  function unlockAll() {
    Chronicle.isAllUnlocked = true;
    Chronicle.sealsUnlocked = Chronicle.totalSeals;
    Object.keys(RUNE_MAP).forEach((key) => unlockEntries(RUNE_MAP[key]));
  }

  // === VISUAL EFFECTS ===
  function showSeal(isTrueSeal = false) {
    const seal = document.getElementById("sealOverlay");
    seal.classList.remove("hidden");
    seal.classList.add("show");

    Sound.sealCrack();

    if (isTrueSeal) {
      const rune = seal.querySelector(".rune");
      rune.style.filter = "drop-shadow(0 0 50px crimson)";
      rune.style.animation = "runeBurst 2s ease forwards";
      setTimeout(() => {
        fadeToBlack("entries/true_ending.html");
      }, 2000);
    }

    setTimeout(() => {
      seal.classList.remove("show");
      setTimeout(() => seal.classList.add("hidden"), 600);
    }, 1300);
  }

  function fadeToBlack(target) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "#000";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 2s ease";
    overlay.style.zIndex = "2000";
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.opacity = "1";
      setTimeout(() => (window.location.href = target), 3000);
    }, 50);
  }

  // === SCARE / DEFENSE MECHANISM ===
  function triggerScare() {
    const overlay = document.getElementById("scareOverlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("on");
    Sound.whisper();

    try {
      const voice = new SpeechSynthesisUtterance("You're not supposed to be here.");
      voice.rate = 0.8;
      voice.pitch = 0.6;
      voice.volume = 1;
      speechSynthesis.speak(voice);
    } catch (_) {}

    setTimeout(() => {
      overlay.classList.remove("on");
      setTimeout(() => overlay.classList.add("hidden"), 1000);
    }, 1500);
  }

  function lockBook() {
    Chronicle.book.classList.add("sealed");
    alert("The Chronicle seals itself shut until the next dawn...");
    Sound.sealCrack();
  }

  // === RANDOM WHISPERS ===
  function randomWhisper() {
    if (Math.random() < Chronicle.whisperChance) Sound.whisper();
  }
  setInterval(randomWhisper, 12000);

  // === ENTRY LOADING SYSTEM ===
  function loadEntry(file) {
    if (!localStorage.getItem("u_" + file)) {
      triggerScare();
      return;
    }

    fetch("entries/" + file)
      .then((res) => res.text())
      .then((html) => {
        const article = document.createElement("article");
        article.classList.add("page");
        article.innerHTML = html;
        Chronicle.book.appendChild(article);
        Chronicle.pages = document.querySelectorAll(".page");
      })
      .catch(() => {
        console.error("Failed to load entry:", file);
      });
  }

  // === TITLE SEQUENCE / SECRET NAME ===
  function secretNameInit() {
    const title = document.querySelector("header h1");
    let count = 0;
    title.addEventListener("click", () => {
      count++;
      if (count >= 7) {
        count = 0;
        const name = prompt("The Chronicle whispers: 'Speak thy True Name...'");
        if ((name || "").toUpperCase().replace(/\s+/g, "") === "VAELINTHORNE") {
          unlockAll();
          showSeal(true);
        } else triggerScare();
      }
    });
  }

  // === SEAL BACKLIGHT EFFECT ===
  function updateSealBack() {
    const progress = Chronicle.sealsUnlocked / Chronicle.totalSeals;
    const book = document.querySelector(".book");
    book.style.boxShadow = `0 0 ${progress * 40}px ${progress * 15}px crimson`;
  }

  // === EVENT BINDINGS ===
  function setup() {
    initBook();
    secretNameInit();
    document
      .getElementById("runeBtn")
      .addEventListener("click", attemptRune);
    document
      .getElementById("runeInput")
      .addEventListener("keydown", (e) => {
        if (e.key === "Enter") attemptRune();
      });

    window.addEventListener("click", Sound.playAmbient, { once: true });
    updateSealBack();
  }

  document.addEventListener("DOMContentLoaded", setup);
})();
