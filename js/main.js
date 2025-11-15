async function loadProjects() {
  try {
    const res = await fetch("data/projects.json");
    const projects = await res.json();
    const container = document.getElementById("projects-grid");
    if (!container) return;

    projects.forEach((p) => {
      const card = document.createElement("article");
      card.className = "project-card";

      const badgeClass =
        p.badgeType === "gain"
          ? "pill pill-gain"
          : p.badgeType === "loss"
          ? "pill pill-loss"
          : "pill pill-neutral";

      card.innerHTML = `
        <div class="project-header">
            <h3>${p.title}</h3>
          <span class="${badgeClass}">${p.badge}</span>
        </div>
        <p>${p.description}</p>
        <ul class="project-meta">
          <li><strong>Stack:</strong> ${p.stack}</li>
          <li><strong>Theme:</strong> ${p.theme}</li>
        </ul>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" target="_blank">GitHub</a>` : ""}
          ${
            p.demo
              ? `<a href="${p.demo}" target="_blank" style="margin-left: 0.75rem;">Live Demo</a>`
              : ""
          }
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading projects:", err);
  }
}

function initTimelineEffects() {
  const aboutSection = document.getElementById("about");
  const timelineTrack = document.querySelector(".timeline-track");
  const progressEl = document.querySelector(".timeline-progress");
  const cards = document.querySelectorAll(".timeline-card");

  if (!aboutSection || !timelineTrack || !progressEl || !cards.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting && entry.intersectionRatio > 0.3);
      });
    },
    {
      threshold: [0.25, 0.35, 0.5],
      rootMargin: "-10% 0px -10% 0px",
    }
  );

  cards.forEach((card) => observer.observe(card));

  const updateTimeline = () => {
    const rect = timelineTrack.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const total = rect.height + viewportHeight;
    const progress = Math.min(Math.max((viewportHeight - rect.top) / total, 0), 1);

    progressEl.style.height = `${progress * 100}%`;
    const shade = 0.04 + progress * 0.18;
    aboutSection.style.setProperty("--timeline-shade", shade.toFixed(2));
  };

  updateTimeline();
  window.addEventListener("scroll", updateTimeline, { passive: true });
  window.addEventListener("resize", updateTimeline);
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
  let hasScanned = false;

  const setState = (state) => {
    scene.dataset.scanState = state;
  };

  setState("idle");

  const playScanSound = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      osc.addEventListener("ended", () => ctx.close());
    } catch (err) {
      console.warn("Unable to play scan sound", err);
    }
  };

  const startScan = () => {
    if (hasScanned || scene.classList.contains("is-scanning")) return;
    scene.classList.add("is-scanning");
    setState("scanning");
    playScanSound();
    setTimeout(() => {
      hasScanned = true;
      scene.classList.add("is-scanned");
      scene.classList.remove("is-scanning");
      setState("granted");
      if (instructionText) {
        instructionText.textContent = "Console ready — choose a number.";
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

function bootstrapPortfolio() {
  loadProjects();
  initTimelineEffects();
  initPhotoResizer();
  initSparkleText();
  initContactPop();
  initCardScanScene();
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
