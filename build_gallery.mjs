// Build gallery.html (index) + gallery/{slug}.html for each property folder.
// Scans photos-web/ as truth. Filters slugs with < 3 photos. Re-runnable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.join(ROOT, 'photos-web');
const THUMB_DIR = path.join(ROOT, 'photos-thumb');
const OUT_GALLERY_DIR = path.join(ROOT, 'gallery');
const MIN_PHOTOS = 3;

const naturalCompare = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

const isJpg = (f) => /\.jpe?g$/i.test(f);

// Floor-plan exports (`1st_floor_*`, `2nd_floor_*`, `all_floors_*`, `*_without_dim*`,
// or just literal `default.jpg`) — push these to the end of the list so the cover
// thumbnail picks a real exterior/interior shot, not a blueprint.
const isFloorPlan = (f) =>
  /^(1st|2nd|3rd|all)_floor/i.test(f) ||
  /_without_dim/i.test(f) ||
  /^default\.jpe?g$/i.test(f);

function nameFromSlug(slug) {
  // Strip dedup/marker suffixes only: trailing "-1" through "-9", "-final".
  let s = slug.replace(/-(final|[1-9])$/i, '');
  s = s.replace(/-/g, ' ').trim();
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function encodeSegment(s) {
  return encodeURIComponent(s);
}

function buildManifest() {
  const slugs = fs
    .readdirSync(WEB_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const houses = [];
  for (const slug of slugs) {
    const slugDir = path.join(WEB_DIR, slug);
    const thumbSlugDir = path.join(THUMB_DIR, slug);
    if (!fs.existsSync(thumbSlugDir)) continue;
    const allJpgs = fs
      .readdirSync(slugDir)
      .filter(isJpg)
      .sort(naturalCompare);
    if (allJpgs.length < MIN_PHOTOS) continue;
    // Real photos first, floor-plan exports last — so photos[0] is a usable cover.
    const photos = [
      ...allJpgs.filter((f) => !isFloorPlan(f)),
      ...allJpgs.filter(isFloorPlan),
    ];
    houses.push({
      slug,
      name: nameFromSlug(slug),
      photoCount: photos.length,
      photos,
    });
  }
  // Sort houses by photoCount descending so the index leads with the strongest galleries.
  houses.sort((a, b) => b.photoCount - a.photoCount);
  return houses;
}

const NAV_HTML = (active, prefix = '') => `
  <nav class="navbar" aria-label="Main navigation">
    <div class="navbar__inner">
      <a class="navbar__logo" href="${prefix}index.html" aria-label="Beyond the Trail Media — Home">
        <img src="${prefix}Logo/logo-green.png" alt="Beyond the Trail Media" />
      </a>
      <ul class="navbar__links">
        <li><a href="${prefix}index.html"${active === 'home' ? ' class="active"' : ''}>Home</a></li>
        <li><a href="${prefix}services.html"${active === 'services' ? ' class="active"' : ''}>Services</a></li>
        <li><a href="${prefix}testimonials.html"${active === 'testimonials' ? ' class="active"' : ''}>Testimonials</a></li>
        <li><a href="${prefix}gallery.html"${active === 'gallery' ? ' class="active"' : ''}>Gallery</a></li>
        <li><a href="${prefix}blog.html"${active === 'blog' ? ' class="active"' : ''}>Blog</a></li>
        <li><a href="${prefix}schedule.html"${active === 'schedule' ? ' class="active"' : ''}>Schedule</a></li>
        <li><a href="${prefix}portal.html"${active === 'portal' ? ' class="active"' : ''}>Client Portal</a></li>
      </ul>
      <div class="navbar__cta">
        <a class="navbar__phone" href="tel:7753385537" aria-label="Call Josh">
          <i class="fa-solid fa-phone" aria-hidden="true"></i>
          775-338-5537
        </a>
        <a class="btn btn-primary btn-sm" href="${prefix}schedule.html">Book a Shoot</a>
      </div>
      <button class="navbar__hamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
    <button class="mobile-menu__close" aria-label="Close menu"><i class="fa-solid fa-xmark"></i></button>
    <nav class="mobile-menu__links">
      <a href="${prefix}index.html">Home</a>
      <a href="${prefix}services.html">Services</a>
      <a href="${prefix}testimonials.html">Testimonials</a>
      <a href="${prefix}gallery.html">Gallery</a>
      <a href="${prefix}blog.html">Blog</a>
      <a href="${prefix}schedule.html">Schedule</a>
      <a href="${prefix}portal.html">Client Portal</a>
    </nav>
    <div class="mobile-menu__footer">
      <a class="mobile-menu__phone" href="tel:7753385537">
        <i class="fa-solid fa-phone"></i> 775-338-5537
      </a>
      <a class="btn btn-amber" href="${prefix}schedule.html">Book a Shoot</a>
    </div>
  </div>
`;

const FOOTER_HTML = (prefix = '') => `
  <footer class="footer" aria-label="Site footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <div class="footer__brand-logo">
            <img src="${prefix}Logo/logo-white.png" alt="Beyond the Trail Media" />
          </div>
          <p class="footer__brand-desc">
            Professional real estate photography for Northern Nevada realtors.
            Drone photos, floor plans, and listing videos — delivered in 24 hours.
          </p>
          <div class="footer__social" aria-label="Social media links">
            <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
            <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
            <a href="#" aria-label="TikTok"><i class="fa-brands fa-tiktok" aria-hidden="true"></i></a>
            <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube" aria-hidden="true"></i></a>
          </div>
        </div>
        <div>
          <p class="footer__col-title">Quick Links</p>
          <nav class="footer__links" aria-label="Footer navigation">
            <a href="${prefix}index.html">Home</a>
            <a href="${prefix}services.html">Services &amp; Pricing</a>
            <a href="${prefix}gallery.html">Gallery</a>
            <a href="${prefix}testimonials.html">Testimonials</a>
            <a href="${prefix}blog.html">Blog</a>
            <a href="${prefix}schedule.html">Schedule a Shoot</a>
            <a href="${prefix}portal.html">Client Portal</a>
          </nav>
        </div>
        <div>
          <p class="footer__col-title">Services</p>
          <nav class="footer__links" aria-label="Services navigation">
            <a href="${prefix}services.html#mls">MLS Photography</a>
            <a href="${prefix}services.html#drone">Drone Photography</a>
            <a href="${prefix}services.html#floorplans">Floor Plans</a>
            <a href="${prefix}services.html#video">Listing Videos</a>
            <a href="${prefix}services.html#alacarte">À La Carte</a>
          </nav>
        </div>
        <div>
          <p class="footer__col-title">Contact</p>
          <div class="footer__contact-item">
            <i class="fa-solid fa-phone" aria-hidden="true"></i>
            <a href="tel:7753385537">775-338-5537</a>
          </div>
          <div class="footer__contact-item">
            <i class="fa-solid fa-envelope" aria-hidden="true"></i>
            <a href="mailto:beyondthetrailmedia@gmail.com">beyondthetrailmedia@gmail.com</a>
          </div>
          <div class="footer__contact-item">
            <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
            <span>Spanish Springs, NV 89441<br />Serving All of Northern Nevada</span>
          </div>
          <div class="footer__contact-item" style="margin-top:8px;">
            <i class="fa-regular fa-clock" aria-hidden="true"></i>
            <span>Mon–Sat · Same-day text replies</span>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <span>&copy; 2026 Beyond the Trail Media LLC. All rights reserved.</span>
        <span>Real Estate Photography · Reno, Nevada</span>
      </div>
    </div>
  </footer>
`;

const HEAD_HTML = (title, description, prefix = '') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="${prefix}style.css" />
</head>
<body>
`;

function renderIndex(houses) {
  const cards = houses
    .map((h) => {
      const cover = h.photos[0];
      const thumb = `photos-thumb/${encodeSegment(h.slug)}/${encodeSegment(cover)}`;
      return `      <a class="gallery-card" href="gallery/${encodeSegment(h.slug)}.html" aria-label="${h.name} — ${h.photoCount} photos">
        <div class="gallery-card__img">
          <img src="${thumb}" alt="" loading="lazy" />
        </div>
        <div class="gallery-card__body">
          <h3 class="gallery-card__title">${h.name}</h3>
          <p class="gallery-card__meta"><i class="fa-regular fa-images" aria-hidden="true"></i> ${h.photoCount} photos</p>
        </div>
      </a>`;
    })
    .join('\n');

  return `${HEAD_HTML(
    'Photo Gallery | Beyond the Trail Media | Real Estate Photography Reno NV',
    'Real estate photography portfolio from Beyond the Trail Media — listings shot across Reno, Sparks, Spanish Springs and Northern Nevada. Drone, MLS, and twilight work.',
    ''
  )}
${NAV_HTML('gallery', '')}

  <section class="page-hero">
    <div class="container page-hero__inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        <span>Gallery</span>
      </nav>
      <h1 class="page-hero__title">The Work</h1>
      <p class="page-hero__sub">
        ${houses.length} listings across Reno, Sparks, Spanish Springs &amp; Northern Nevada.
        Drone, exterior, interior, twilight — every shot delivered in 24 hours.
      </p>
    </div>
  </section>

  <section class="section bg-off-white" aria-label="Property gallery">
    <div class="container">
      <div class="gallery-grid gallery-grid--cards">
${cards}
      </div>
    </div>
  </section>

${FOOTER_HTML('')}

  <script src="script.js"></script>
</body>
</html>
`;
}

function renderHousePage(house) {
  const tiles = house.photos
    .map((file) => {
      const thumb = `../photos-thumb/${encodeSegment(house.slug)}/${encodeSegment(file)}`;
      const full = `../photos-web/${encodeSegment(house.slug)}/${encodeSegment(file)}`;
      return `        <button type="button" class="gallery-tile" data-full="${full}" aria-label="Open photo">
          <img src="${thumb}" alt="" loading="lazy" />
        </button>`;
    })
    .join('\n');

  return `${HEAD_HTML(
    `${house.name} — Real Estate Photography Gallery | Beyond the Trail Media`,
    `${house.photoCount} photos from a Beyond the Trail Media real estate shoot at ${house.name}, Reno NV. Drone, exterior, interior.`,
    '../'
  )}
${NAV_HTML('gallery', '../')}

  <section class="page-hero">
    <div class="container page-hero__inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a>
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        <a href="../gallery.html">Gallery</a>
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        <span>${house.name}</span>
      </nav>
      <h1 class="page-hero__title">${house.name}</h1>
      <p class="page-hero__sub">
        ${house.photoCount} photos · Shot by Josh for Beyond the Trail Media. Click any photo to view full size.
      </p>
    </div>
  </section>

  <section class="section bg-off-white" aria-label="Photos of ${house.name}">
    <div class="container">
      <div class="gallery-grid">
${tiles}
      </div>
    </div>
  </section>

${FOOTER_HTML('../')}

  <script src="../script.js"></script>
  <script src="lightbox.js"></script>
</body>
</html>
`;
}

function main() {
  if (!fs.existsSync(WEB_DIR)) {
    console.error(`photos-web/ not found at ${WEB_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_GALLERY_DIR, { recursive: true });

  const houses = buildManifest();
  if (houses.length === 0) {
    console.error('No houses with >= 3 photos found.');
    process.exit(1);
  }

  // Index
  fs.writeFileSync(path.join(ROOT, 'gallery.html'), renderIndex(houses));

  // Per-house pages
  for (const h of houses) {
    fs.writeFileSync(
      path.join(OUT_GALLERY_DIR, `${h.slug}.html`),
      renderHousePage(h)
    );
  }

  console.log(`Generated gallery.html + ${houses.length} sub-pages.`);
  console.log('Houses (by photo count):');
  for (const h of houses) {
    console.log(`  ${String(h.photoCount).padStart(3)}  ${h.slug}  (${h.name})`);
  }
}

main();
