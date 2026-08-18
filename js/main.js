async function loadProjects() {
  try {
    const res = await fetch("data/projects.json");
    const projects = await res.json();
    const container = document.getElementById("projects-grid");
    if (!container) return;

    const statPalette = ["stat-bubble--accent", "stat-bubble--gain", "stat-bubble--neutral"];
    const badgeClassFor = (type) =>
      type === "gain" ? "pill pill-gain" : type === "loss" ? "pill pill-loss" : "pill pill-neutral";

    projects.forEach((p) => {
      const card = document.createElement("article");
      card.className = "project-card";

      const badgesRow =
        Array.isArray(p.badges) && p.badges.length
          ? p.badges.map((b) => `<span class="${badgeClassFor(b.type)}">${b.text}</span>`).join("")
          : "";

      const eventLine = p.eventLine ? `<p class="project-event-line">${p.eventLine}</p>` : "";

      const languageBubbles =
        Array.isArray(p.languages) && p.languages.length
          ? `
        <div class="project-languages stat-bubbles">
          ${p.languages
            .map((language, index) => {
              const palette = statPalette[index % statPalette.length];
              return `<span class="stat-bubble ${palette}">${language}</span>`;
            })
            .join("")}
        </div>
      `
          : "";

      const metricsList =
        Array.isArray(p.stats) && p.stats.length
          ? `
        <ul class="project-metrics">
          ${p.stats
            .map((stat) => `<li><span class="metric-icon">↗</span>${stat}</li>`)
            .join("")}
        </ul>
      `
          : "";

      card.innerHTML = `
        <div class="project-media">
          <img src="${p.mainImage}" alt="${p.mainImageAlt || p.title}" loading="lazy">
          ${
            p.badgeImage
              ? `<img class="project-overlay-badge" src="${p.badgeImage}" alt="${p.title} award badge" loading="lazy">`
              : ""
          }
        </div>
        <div class="project-content">
          <div class="project-header">
            <h3>${p.title}</h3>
            <div class="project-badges">${badgesRow}</div>
          </div>
          <div class="project-body">
            ${eventLine}
            <p class="project-description">${p.description}</p>
            ${metricsList}
            ${languageBubbles}
          </div>
          <div class="project-links">
            ${p.github ? `<a href="${p.github}" target="_blank">GitHub</a>` : ""}
            ${p.demo ? `<a href="${p.demo}" target="_blank">Live Demo</a>` : ""}
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading projects:", err);
  }
}

function initPhotoResizer() {
  const slider = document.getElementById("photoSize");
  if (!slider) return;

  const valueEl = document.querySelector(".photo-size-value");
  const root = document.documentElement;

  const setSize = (value) => {
    const pixels = `${value}px`;
    root.style.setProperty("--profile-photo-size", pixels);
    if (valueEl) {
      valueEl.textContent = pixels;
    }
    slider.setAttribute("aria-valuenow", value);
  };

  setSize(slider.value);
  slider.addEventListener("input", (event) => setSize(event.target.value));
}
function initSparkleText() {
  const sparkleEls = document.querySelectorAll(".sparkle-text");
  sparkleEls.forEach((el, index) => {
    const interval = 3200 + index * 500;
    setInterval(() => {
      el.classList.add("is-sparkling");
      setTimeout(() => el.classList.remove("is-sparkling"), 700);
    }, interval);
  });
}

function initContactPop() {
  const cards = document.querySelectorAll("[data-pop-card]");
  cards.forEach((card) => {
    let timeoutId;
    card.addEventListener("click", () => {
      card.classList.add("is-popped");
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => card.classList.remove("is-popped"), 600);
    });
  });
}

function initCardScanScene() {
  const scene = document.querySelector("[data-scan-scene]");
  if (!scene) return;

  const triggers = scene.querySelectorAll("[data-scan-trigger]");
  const navButtons = scene.querySelectorAll("[data-scan-link]");
  const instructionText = scene.querySelector("[data-scan-text]");
  const statusText = scene.querySelector("[data-scan-status]");
  const totalText = scene.querySelector("[data-scan-total]");
  const directive = document.querySelector(".hero-directive");
  const heroSection = scene.closest(".hero-cardscan");
  let hasScanned = false;

  const setState = (state) => {
    scene.dataset.scanState = state;
  };

  setState("idle");
  if (statusText) {
    statusText.textContent = "Waiting for card…";
  }
  if (totalText) {
    totalText.textContent = "$0.00";
  }

  const playScanSound = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const playNote = (freq, startTime, duration, peakGain, type) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
        return osc;
      };

      // "cha"
      playNote(880, now, 0.16, 0.3, "triangle");
      // "ching" — bell tone plus a quiet high shimmer overtone
      const bell = playNote(1318.5, now + 0.1, 0.5, 0.3, "triangle");
      playNote(2637, now + 0.1, 0.35, 0.1, "sine");

      bell.addEventListener("ended", () => ctx.close());
    } catch (err) {
      console.warn("Unable to play scan sound", err);
    }
  };

  const dismissDirective = () => {
    if (directive) {
      directive.classList.add("is-dismissed");
    }
    if (heroSection) {
      heroSection.classList.add("hero-cardscan--directive-dismissed");
    }
  };

  const startScan = () => {
    dismissDirective();
    if (hasScanned || scene.classList.contains("is-scanning")) return;
    scene.classList.add("is-scanning");
    setState("scanning");
    if (statusText) {
      statusText.textContent = "Authenticating…";
    }
    if (totalText) {
      totalText.textContent = "— —";
    }
    playScanSound();
    setTimeout(() => {
      hasScanned = true;
      scene.classList.add("is-scanned");
      scene.classList.remove("is-scanning");
      setState("granted");
      if (instructionText) {
        instructionText.textContent = "Console READY: select a number.";
      }
      if (statusText) {
        statusText.textContent = "Approved · Console unlocked";
      }
      if (totalText) {
        totalText.textContent = "Access 100%";
      }
    }, 1200);
  };

  const handleTriggerKey = (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      startScan();
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", startScan);
    trigger.addEventListener("keydown", handleTriggerKey);
  });

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  navButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const destination = button.dataset.scanLink;
      if (!destination) return;
      event.preventDefault();
      if (!hasScanned) {
        startScan();
        setTimeout(() => scrollToSection(destination), 1300);
      } else {
        scrollToSection(destination);
      }
    });
  });
}

function initDirectiveTyping() {
  const typedEl = document.querySelector("[data-typed-directive]");
  if (!typedEl) return;

  const caret = typedEl.parentElement?.querySelector?.(".hero-directive__caret");
  const message = typedEl.dataset.directiveText?.trim() || typedEl.textContent.trim();
  if (!message) return;

  const LOOP_DELAY = 120000;
  let typingTimeout;
  let restartTimeout;

  const typeMessage = () => {
    clearTimeout(typingTimeout);
    clearTimeout(restartTimeout);
    typedEl.textContent = "";
    if (caret) {
      caret.classList.add("is-typing");
    }
    let index = 0;

    const typeNext = () => {
      if (index < message.length) {
        typedEl.textContent += message.charAt(index);
        index += 1;
        typingTimeout = setTimeout(typeNext, 70 + Math.random() * 40);
      } else {
        if (caret) {
          caret.classList.remove("is-typing");
        }
        restartTimeout = setTimeout(typeMessage, LOOP_DELAY);
      }
    };

    typeNext();
  };

  typeMessage();
}

function bootstrapPortfolio() {
  loadProjects();
  initPhotoResizer();
  initSparkleText();
  initContactPop();
  initCardScanScene();
  initDirectiveTyping();
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapPortfolio);
} else {
  bootstrapPortfolio();
}