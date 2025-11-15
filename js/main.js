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

      const stats = [
        { label: "Stack", value: p.stack },
        { label: "Theme", value: p.theme },
      ];

      const githubIcon = `
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path
            d="M12 2C6.48 2 2 6.58 2 12.21c0 4.48 2.87 8.28 6.84 9.63.5.1.68-.22.68-.5 0-.25-.01-1.08-.02-1.96-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.94.85.09-.68.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.09 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.07a9.22 9.22 0 0 1 5 0c1.91-1.34 2.75-1.07 2.75-1.07.55 1.42.2 2.47.1 2.73.64.73 1.03 1.66 1.03 2.79 0 3.96-2.34 4.82-4.57 5.08.36.32.68.95.68 1.92 0 1.39-.02 2.51-.02 2.85 0 .28.18.61.69.5A10.03 10.03 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z"
          />
        </svg>
      `;

      card.innerHTML = `
        <div class="project-header">
          <h3>${p.title}</h3>
          <span class="${badgeClass}">${p.badge}</span>
        </div>
        <p class="project-slogan">${p.slogan ?? p.description ?? ""}</p>
        <div class="project-stats">
          ${stats
            .map(
              (stat) => `
                <div class="stat-bubble">
                  <span class="stat-label">${stat.label}</span>
                  <span class="stat-value">${stat.value}</span>
                </div>
              `
            )
            .join("")}
        </div>
        ${
          p.github
            ? `<div class="project-links">
                <a
                  class="project-link project-link--github"
                  href="${p.github}"
                  target="_blank"
                  rel="noopener"
                  aria-label="View ${p.title} on GitHub"
                >
                  ${githubIcon}
                </a>
              </div>`
            : ""
        }
        ${
          p.demo
            ? `<div class="project-links project-links--demo">
                <a href="${p.demo}" target="_blank" rel="noopener">Live Demo</a>
              </div>`
            : ""
        }
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
        instructionText.textContent = "Console ready — choose a number.";
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
  initTimelineEffects();
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

function bootstrapPortfolio() {
  loadProjects();
  initTimelineEffects();
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