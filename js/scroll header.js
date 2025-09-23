document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");

  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
});
