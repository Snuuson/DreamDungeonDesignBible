(() => {
  const dialog = document.querySelector("#concept-lightbox");
  const dialogImage = dialog?.querySelector("img");
  const dialogCaption = dialog?.querySelector("figcaption");
  const closeButton = dialog?.querySelector(".concept-lightbox-close");
  const imageLinks = document.querySelectorAll(".concept-image-link");
  let trigger = null;

  if (!dialog || !dialogImage || !dialogCaption || !closeButton) return;

  const closeViewer = () => {
    dialog.close();
  };

  imageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const card = link.closest(".concept-card");
      const sourceImage = link.querySelector("img");
      const act = card?.querySelector(".eyebrow")?.textContent?.trim();
      const colors = card?.querySelector("h3")?.textContent?.trim();

      trigger = link;
      dialogImage.src = link.href;
      dialogImage.alt = sourceImage?.alt || "Full-size Dream Dungeon concept art";
      dialogCaption.textContent = [act, colors].filter(Boolean).join(" — ");
      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeViewer);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeViewer();
  });
  dialog.addEventListener("close", () => {
    dialogImage.src = "";
    trigger?.focus();
    trigger = null;
  });
})();
