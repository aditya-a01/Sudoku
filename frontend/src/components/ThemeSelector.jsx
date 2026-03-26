import React from "react";

const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "neon", label: "Neon" },
  { id: "pastel", label: "Pastel" },
  { id: "forest", label: "Forest" },
  { id: "sunset", label: "Sunset" },
  { id: "ocean", label: "Ocean" },
  { id: "midnight", label: "Midnight" },
  { id: "retro", label: "Retro" },
  { id: "custom", label: "Custom" }
];

export default function ThemeSelector({ theme, setTheme, customColors, setCustomColors }) {
  return (
    <section className="panel">
      <h3>Theme</h3>
      <div className="theme-buttons">
        {themes.map((item) => (
          <button
            key={item.id}
            className={theme === item.id ? "active" : ""}
            onClick={() => setTheme(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {theme === "custom" && (
        <div className="custom-theme-picker">
          <label>
            Background
            <input
              type="color"
              value={customColors.bg}
              onChange={(e) => setCustomColors((prev) => ({ ...prev, bg: e.target.value }))}
            />
          </label>
          <label>
            Surface
            <input
              type="color"
              value={customColors.surface}
              onChange={(e) => setCustomColors((prev) => ({ ...prev, surface: e.target.value }))}
            />
          </label>
          <label>
            Accent
            <input
              type="color"
              value={customColors.accent}
              onChange={(e) => setCustomColors((prev) => ({ ...prev, accent: e.target.value }))}
            />
          </label>
          <label>
            Text
            <input
              type="color"
              value={customColors.text}
              onChange={(e) => setCustomColors((prev) => ({ ...prev, text: e.target.value }))}
            />
          </label>
        </div>
      )}
    </section>
  );
}
