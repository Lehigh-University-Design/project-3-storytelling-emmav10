// Start JS script code

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menu-button');
  const overlay = document.getElementById('myNav');

  // If button exists, let clicks toggle the overlay and the visual state
  if (btn && overlay) {
    btn.addEventListener('click', () => {
      // If overlay is visible (width not 0), close it; otherwise open it
      const isOpen = overlay.style.width && overlay.style.width !== '0%' && overlay.style.width !== '0px' && overlay.style.width !== '';
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });
  }
});

/* Open the overlay navigation */
function openNav() {
  const overlay = document.getElementById("myNav");
  if (overlay) overlay.style.width = "100%";
  const btn = document.getElementById('menu-button');
  if (btn) btn.classList.add('open');
}

/* Close the overlay navigation */
function closeNav() {
  const overlay = document.getElementById("myNav");
  if (overlay) overlay.style.width = "0%";
  const btn = document.getElementById('menu-button');
  if (btn) btn.classList.remove('open');
}