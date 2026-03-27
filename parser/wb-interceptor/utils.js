"use strict";

// Глобальный обработчик ошибок изображений
document.addEventListener(
  "error",
  function (e) {
    if (
      e.target.tagName === "IMG" &&
      e.target.classList.contains("product-img")
    ) {
      e.target.src =
        "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%23222222%22 width=%2240%22 height=%2240%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23666666%22>📦</text></svg>";
    }
  },
  true,
);
