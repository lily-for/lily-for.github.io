// Browse the current project's photos without closing the full-size viewer.
const lightbox = document.getElementById('lightbox');
const image = document.getElementById('lightbox-image');
const previous = document.getElementById('previous-photo');
const next = document.getElementById('next-photo');
let opener;
let photos = [];
let photoIndex = 0;

function renderPhoto() {
  const photo = photos[photoIndex];
  image.src = photo.src;
  image.alt = photo.caption;
  document.getElementById('lightbox-caption').textContent = photo.caption;
  document.getElementById('lightbox-count').textContent = `${photoIndex + 1} / ${photos.length}`;
  document.getElementById('original-link').href = photo.src;
  previous.disabled = next.disabled = photos.length < 2;
}

function movePhoto(step) {
  if (!lightbox.open || photos.length < 2) return;
  photoIndex = (photoIndex + step + photos.length) % photos.length;
  renderPhoto();
}

document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  const project = button.closest('.case');
  const seen = new Set();
  photos = Array.from(project.querySelectorAll('.gallery [data-photo]')).filter(photo => {
    if (seen.has(photo.dataset.photo)) return false;
    seen.add(photo.dataset.photo);
    return true;
  }).map(photo => ({ key: photo.dataset.photo, src: photo.querySelector('img').src, caption: photo.dataset.caption }));
  // Include a lead image if it isn't also present in the gallery.
  if (!seen.has(button.dataset.photo)) photos.unshift({ key: button.dataset.photo, src: button.querySelector('img').src, caption: button.dataset.caption });
  photoIndex = photos.findIndex(photo => photo.key === button.dataset.photo);
  renderPhoto();
  lightbox.showModal();
  document.body.classList.add('modal-open');
}));

previous.addEventListener('click', () => movePhoto(-1));
next.addEventListener('click', () => movePhoto(1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
  }
});

let touchStart = null;
const stage = document.querySelector('.lightbox-stage');
stage.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
stage.addEventListener('touchend', event => {
  if (!touchStart || !event.changedTouches.length) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) movePhoto(dx < 0 ? 1 : -1);
}, { passive: true });
stage.addEventListener('touchcancel', () => { touchStart = null; });

document.getElementById('close-lightbox').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const bounds = lightbox.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  touchStart = null;
  opener?.focus();
});
