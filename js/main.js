function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return res.json();
}

function renderProjects(projects) {
  const container = document.getElementById("projects-grid");
  if (!container) return;

  container.innerHTML = projects
    .map((project) => {
      const pills = (project.stack || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      const hackathon = project.hackathonUrl
        ? `<a class="mention" href="${escapeHtml(project.hackathonUrl)}" target="_blank" rel="noreferrer">${escapeHtml(project.hackathon)}</a>`
        : escapeHtml(project.hackathon || "");
      const trophy = project.firstPlace
        ? `<span class="award-trophy" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M8 4h8v3.2c0 2.4-1.7 4.4-4 4.8-2.3-.4-4-2.4-4-4.8V4z" stroke="currentColor" stroke-width="1.6"/><path d="M8 5.2H5.6C5.6 7.6 7 9.5 9.2 10M16 5.2h2.4C18.4 7.6 17 9.5 14.8 10M10.2 12.2h3.6v2.2h-3.6zM9.4 20h5.2M12 14.4V20" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></span>`
        : "";
      const awardParts = [escapeHtml(project.award), hackathon, escapeHtml(project.extraAward)].filter(Boolean);
      const prizes = (project.prizes || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");

      const bullets = (project.bullets || [])
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("");
      const copy = bullets
        ? `<ul class="extras-bullets">${bullets}</ul>`
        : project.description
          ? `<p>${escapeHtml(project.description)}</p>`
          : "";
      const media = project.image
        ? `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt || project.title)}" />`
        : "";

      return `
        <article class="project-card">
          ${media}
          <div class="project-body">
            ${awardParts.length ? `<p class="award">${trophy}${awardParts.join(" · ")}</p>` : ""}
            ${prizes ? `<ul class="prizes">${prizes}</ul>` : ""}
            <h3>${escapeHtml(project.title)}</h3>
            ${copy}
            <ul class="pills">${pills}</ul>
            <div class="project-links">
              ${project.github ? `<a href="${escapeHtml(project.github)}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
              ${project.devpost ? `<a href="${escapeHtml(project.devpost)}" target="_blank" rel="noreferrer">Devpost</a>` : ""}
              ${project.article ? `<a href="${escapeHtml(project.article)}" target="_blank" rel="noreferrer">Article</a>` : ""}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function isOngoing(date) {
  return /present|current|now/i.test(date || "");
}

function orgLogo(item) {
  if (item.logo) {
    return `<img src="${escapeHtml(item.logo)}" alt="${escapeHtml(item.name)} logo" />`;
  }
  return `<span class="extras-marker__fallback">${escapeHtml(item.logoText || item.name.charAt(0))}</span>`;
}

function renderExtras(items) {
  const rail = document.getElementById("extras-rail");
  const panel = document.getElementById("extras-panel");
  const count = document.querySelector("[data-extras-count]");
  const prev = document.querySelector("[data-extras-prev]");
  const next = document.querySelector("[data-extras-next]");
  if (!rail || !panel || !items.length) return;

  let selected = 0;

  const paintPanel = (item) => {
    const org = item.href
      ? `<a class="org" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">${escapeHtml(item.name)}</a>`
      : `<span class="org">${escapeHtml(item.name)}</span>`;
    const visit = item.href
      ? `<a class="extras-panel__visit" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">Visit ↗</a>`
      : "";

    panel.innerHTML = `
      <div class="extras-panel__logo">${orgLogo(item)}</div>
      <div>
        <div class="extras-panel__top">
          <h3>${escapeHtml(item.role)}</h3>
          <p class="experience-meta">${escapeHtml(item.date)}</p>
        </div>
        <p class="extras-org-line">${org}</p>
        <p class="experience-meta">${escapeHtml(item.location || "")}</p>
        <ul class="extras-bullets">
          ${(item.bullets || []).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
        </ul>
        ${visit}
      </div>
    `;
  };

  const select = (index) => {
    selected = Math.max(0, Math.min(items.length - 1, index));
    rail.querySelectorAll(".extras-marker").forEach((marker, i) => {
      marker.classList.toggle("is-active", i === selected);
      marker.setAttribute("aria-selected", i === selected ? "true" : "false");
    });
    paintPanel(items[selected]);
    if (count) count.textContent = `${selected + 1} / ${items.length}`;
    if (prev) prev.disabled = selected === 0;
    if (next) next.disabled = selected === items.length - 1;
    const active = rail.children[selected];
    if (active && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  };

  rail.innerHTML = items
    .map((item, index) => {
      const ongoing = isOngoing(item.date) ? " is-ongoing" : "";
      return `
        <li>
          <button
            type="button"
            class="extras-marker${ongoing}"
            data-extras-index="${index}"
            aria-selected="${index === 0 ? "true" : "false"}"
          >
            <span class="extras-marker__logo">${orgLogo(item)}</span>
            <span class="extras-marker__name">${escapeHtml(item.shortName || item.name)}</span>
          </button>
        </li>
      `;
    })
    .join("");

  rail.addEventListener("click", (event) => {
    const button = event.target.closest("[data-extras-index]");
    if (!button) return;
    select(Number(button.dataset.extrasIndex));
  });

  prev?.addEventListener("click", () => select(selected - 1));
  next?.addEventListener("click", () => select(selected + 1));

  const widget = rail.closest(".extras-widget");
  widget?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      select(selected - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      select(selected + 1);
    }
  });

  select(0);
}

function renderAwards(awards) {
  const list = document.getElementById("awards-list");
  if (!list) return;
  list.innerHTML = awards
    .map((award) => {
      const icon = award.icon
        ? `<span class="awards-icon"><img src="${escapeHtml(award.icon)}" alt="" /></span>`
        : "";
      return `
        <li>
          ${icon}
          <div>
            <strong>${escapeHtml(award.title)}</strong>
            <small>${escapeHtml(award.date)}</small>
            <p>${escapeHtml(award.blurb)}</p>
          </div>
        </li>
      `;
    })
    .join("");
}

function initDiscordCopy() {
  const link = document.querySelector("[data-copy]");
  if (!link) return;
  link.addEventListener("click", async (event) => {
    const value = link.dataset.copy;
    if (!value || !navigator.clipboard) return;
    const label = link.querySelector("[data-copy-label]") || link;
    try {
      await navigator.clipboard.writeText(value);
      const original = label.textContent;
      label.textContent = "Copied @sandy917";
      event.preventDefault();
      setTimeout(() => {
        label.textContent = original;
      }, 1400);
    } catch {
      /* keep the Discord href as fallback */
    }
  });
}

function renderExperience(roles) {
  const container = document.getElementById("experience-list");
  if (!container) return;

  container.innerHTML = roles
    .map((role) => {
      const pills = (role.skills || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      const company = role.href
        ? `<a class="org" href="${escapeHtml(role.href)}" target="_blank" rel="noreferrer">${escapeHtml(role.company)}</a>`
        : `<span class="org">${escapeHtml(role.company)}</span>`;
      const bullets = (role.bullets || [])
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("");
      const detail = bullets
        ? `<ul class="extras-bullets">${bullets}</ul>`
        : role.blurb
          ? `<p class="experience-blurb">${escapeHtml(role.blurb)}</p>`
          : "";

      return `
        <li class="experience-item">
          <div class="experience-logo">
            <img src="${escapeHtml(role.logo)}" alt="${escapeHtml(role.company)} logo" />
          </div>
          <div>
            <div class="experience-top">
              <h3>${escapeHtml(role.role)} · ${company}</h3>
              <p class="experience-meta">${escapeHtml(role.period)} · ${escapeHtml(role.duration)}</p>
            </div>
            <p class="experience-meta">${escapeHtml(role.location)} · ${escapeHtml(role.type)}</p>
            ${detail}
            ${pills ? `<ul class="pills">${pills}</ul>` : ""}
          </div>
        </li>
      `;
    })
    .join("");
}

function initNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const label = toggle?.querySelector(".nav-toggle-label");
  if (!header || !toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    header.classList.toggle("is-open", open);
    if (label) label.textContent = open ? "Close" : "Menu";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 761px)").matches) setOpen(false);
  });
}

async function bootstrap() {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  try {
    const [projects, experience, extras, awards] = await Promise.all([
      loadJson("data/projects.json"),
      loadJson("data/experience.json"),
      loadJson("data/extracurriculars.json"),
      loadJson("data/awards.json"),
    ]);
    renderProjects(projects);
    renderExperience(experience);
    renderExtras(extras);
    renderAwards(awards);
    initDiscordCopy();
  } catch (err) {
    console.error(err);
  }
  initNav();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
