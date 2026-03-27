"use strict";

// Глобальный обработчик ошибок изображений для tracker.html
document.addEventListener(
  "error",
  function (e) {
    if (
      e.target.tagName === "IMG" &&
      (e.target.classList.contains("card-img") ||
        e.target.classList.contains("modal-img"))
    ) {
      e.target.src =
        "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23111111%22 width=%22100%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23333333%22 font-size=%2240%22>📦</text></svg>";
    }
  },
  true,
);
