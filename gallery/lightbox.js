(() => {
  const tiles = Array.from(document.querySelectorAll('.gallery-tile'));
  if (!tiles.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Photo viewer');
  overlay.innerHTML = `
    <button type="button" class="lightbox__close" aria-label="Close (Esc)">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
    <button type="button" class="lightbox__nav lightbox__prev" aria-label="Previous photo">
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
    </button>
    <figure class="lightbox__stage">
      <img class="lightbox__img" alt="" />
      <figcaption class="lightbox__counter" aria-live="polite"></figcaption>
    </figure>
    <button type="button" class="lightbox__nav lightbox__next" aria-label="Next photo">
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  `;
  document.body.appendChild(overlay);

  const urls = tiles.map((t) => t.dataset.full);
  const img = overlay.querySelector('.lightbox__img');
  const counter = overlay.querySelector('.lightbox__counter');
  let i = 0;

  const show = (k) => {
    i = ((k % urls.length) + urls.length) % urls.length;
    img.src = urls[i];
    counter.textContent = `${i + 1} / ${urls.length}`;
  };
  const open = (k) => {
    show(k);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  tiles.forEach((tile, k) => {
    tile.addEventListener('click', () => open(k));
  });
  overlay.querySelector('.lightbox__close').addEventListener('click', close);
  overlay.querySelector('.lightbox__prev').addEventListener('click', (e) => {
    e.stopPropagation();
    show(i - 1);
  });
  overlay.querySelector('.lightbox__next').addEventListener('click', (e) => {
    e.stopPropagation();
    show(i + 1);
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(i - 1);
    else if (e.key === 'ArrowRight') show(i + 1);
  });
})();
