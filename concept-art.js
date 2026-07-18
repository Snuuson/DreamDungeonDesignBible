(() => {
  const dialog = document.querySelector("#concept-lightbox");
  const dialogImage = dialog?.querySelector("img");
  const dialogCaption = dialog?.querySelector("figcaption");
  const closeButton = dialog?.querySelector(".concept-lightbox-close");
  let trigger = null;

  if (!dialog || !dialogImage || !dialogCaption || !closeButton) return;

  document.addEventListener("click", (event) => {
    const imageTrigger = event.target.closest("[data-full-image]");
    if (!imageTrigger) return;

    trigger = imageTrigger;
    dialogImage.src = imageTrigger.dataset.fullImage;
    dialogImage.alt = imageTrigger.querySelector("img")?.alt || "Full-size Dream Dungeon concept art";
    dialogCaption.textContent = imageTrigger.dataset.caption || dialogImage.alt;
    dialog.showModal();
    closeButton.focus();
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    dialogImage.removeAttribute("src");
    dialogImage.alt = "";
    dialogCaption.textContent = "";
    trigger?.focus();
    trigger = null;
  });
})();
