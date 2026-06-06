// Depósito Dental San Lorenzo - Landing JS con galería lightbox
const fotos = [
  '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg',
  '6.jpeg', '7.jpeg', '8.jpeg', '9.jpeg', '10.jpeg'
];

let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Renderizar galería de fotos
  const galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid) {
    galleryGrid.innerHTML = fotos.map((foto, index) => `
      <img src="assets/img/${foto}" alt="Depósito Dental San Lorenzo" loading="lazy" onclick="openLightbox(${index})">
    `).join('');
  }
});

// Funciones del lightbox
function openLightbox(index) {
  currentIndex = index;
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const counter = document.getElementById('lightbox-counter');
  
  img.src = `assets/img/${fotos[currentIndex]}`;
  counter.textContent = `${currentIndex + 1} / ${fotos.length}`;
  lightbox.style.display = 'flex';
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
}

function changeImage(direction) {
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = fotos.length - 1;
  if (currentIndex >= fotos.length) currentIndex = 0;
  
  const img = document.getElementById('lightbox-img');
  const counter = document.getElementById('lightbox-counter');
  img.src = `assets/img/${fotos[currentIndex]}`;
  counter.textContent = `${currentIndex + 1} / ${fotos.length}`;
}

// Cerrar con tecla ESC y navegar con flechas
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') changeImage(-1);
  if (e.key === 'ArrowRight') changeImage(1);
});