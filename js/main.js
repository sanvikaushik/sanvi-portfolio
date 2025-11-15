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

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
