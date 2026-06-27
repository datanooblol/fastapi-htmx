function toggleTheme() {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateToggleButton(next);
}

function updateToggleButton(theme) {
    const icon = document.getElementById("theme-icon");
    const label = document.getElementById("theme-label");
    if (icon) icon.textContent = theme === "dark" ? "☾" : "☀";
    if (label) label.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

(function () {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    updateToggleButton(saved);
})();
