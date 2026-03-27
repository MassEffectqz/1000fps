/**
 * Theme Toggle Script for 1000FPS
 * Handles switching between dark and light themes with localStorage persistence
 */

(function () {
  "use strict";

  const THEME_KEY = "1000fps-theme";
  const LIGHT_THEME = "light";
  const DARK_THEME = "dark";

  /**
   * Get saved theme from localStorage
   * @returns {string|null}
   */
  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  /**
   * Save theme to localStorage
   * @param {string} theme
   */
  function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  /**
   * Apply theme to document
   * @param {string} theme - 'light' or 'dark'
   */
  function applyTheme(theme) {
    if (theme === LIGHT_THEME) {
      document.documentElement.setAttribute("data-theme", LIGHT_THEME);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  /**
   * Get current theme
   * @returns {string}
   */
  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || DARK_THEME;
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    applyTheme(newTheme);
    saveTheme(newTheme);
    updateToggleButtonIcons();
  }

  /**
   * Update toggle button icons based on current theme
   */
  function updateToggleButtonIcons() {
    const toggleBtn = document.getElementById("themeToggle");
    if (!toggleBtn) return;

    const currentTheme = getCurrentTheme();
    toggleBtn.setAttribute(
      "aria-label",
      currentTheme === LIGHT_THEME
        ? "Переключить на тёмную тему"
        : "Переключить на светлую тему",
    );
    toggleBtn.setAttribute(
      "data-tip",
      currentTheme === LIGHT_THEME ? "Тёмная тема" : "Светлая тема",
    );
  }

  /**
   * Initialize theme on page load
   */
  function initTheme() {
    // Check for saved theme preference, or use system preference
    const savedTheme = getSavedTheme();

    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Check system preference
      const prefersLight = window.matchMedia(
        "(prefers-color-scheme: light)",
      ).matches;
      applyTheme(prefersLight ? LIGHT_THEME : DARK_THEME);
    }

    updateToggleButtonIcons();
  }

  /**
   * Initialize theme toggle button event listener
   */
  function initToggleButton() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachToggleListener);
    } else {
      attachToggleListener();
    }
  }

  /**
   * Attach click event listener to toggle button
   */
  function attachToggleListener() {
    const toggleBtn = document.getElementById("themeToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleTheme);
    }
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", (e) => {
        if (!getSavedTheme()) {
          // Only auto-switch if user hasn't manually set a preference
          applyTheme(e.matches ? LIGHT_THEME : DARK_THEME);
          updateToggleButtonIcons();
        }
      });
  }

  // Initialize
  initTheme();
  initToggleButton();

  // Expose toggleTheme globally for inline handlers if needed
  window.toggleTheme = toggleTheme;
})();
