/**
 * Minimal SVG icons for each technology (24×24 viewBox).
 */
const TECH_ICONS = {
  'writing': '<path d="M4 20h16M7 4l10 10M7 4v5h5" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  'printing-press': '<rect x="3" y="8" width="18" height="10" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M6 8V5h12v3M8 18v3M16 18v3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  'novels': '<path d="M5 4h5a2 2 0 012 2v14a2 2 0 00-2-2H5V4zm9 0h5v14h-5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  'railways': '<rect x="2" y="10" width="20" height="6" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="7" cy="16" r="2" fill="currentColor"/><circle cx="17" cy="16" r="2" fill="currentColor"/><path d="M6 10V6h12v4" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  'telegraph': '<path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  'telephone': '<path d="M7 3h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A15 15 0 013 9a2 2 0 012-2z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  'movies': '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 9h18M8 5v4M16 5v4M8 15v4M16 15v4" stroke="currentColor" stroke-width="1.5"/>',
  'radio': '<circle cx="12" cy="14" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 10a8 8 0 0116 0M10 12a4 4 0 018 0" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="currentColor"/>',
  'comic-books': '<rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 9h3v3H8zM13 9h3v3h-3zM8 14h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  'television': '<rect x="2" y="5" width="20" height="13" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 21h8M12 18v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  'rock-and-roll': '<path d="M9 18V6l10-2v12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><circle cx="7" cy="18" r="2.5" fill="currentColor"/><circle cx="17" cy="16" r="2.5" fill="currentColor"/>',
  'pocket-calculator': '<rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="7" y="4" width="10" height="4" rx="1" fill="currentColor" opacity="0.35"/><path d="M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  'home-video-vhs': '<rect x="3" y="6" width="18" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 10h4v4H7zM14 10l4 2-4 2z" fill="currentColor" opacity="0.8"/>',
  'personal-computer': '<rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 20h8M10 16v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  'dungeons-and-dragons': '<rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="8" cy="8" r="1.25" fill="currentColor"/><circle cx="16" cy="8" r="1.25" fill="currentColor"/><circle cx="12" cy="14" r="1.25" fill="currentColor"/><circle cx="8" cy="16" r="1.25" fill="currentColor"/><circle cx="16" cy="16" r="1.25" fill="currentColor"/>',
  'video-games': '<rect x="3" y="8" width="18" height="10" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 11v6M6 14h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="16.5" cy="12" r="1" fill="currentColor"/><circle cx="18.5" cy="14" r="1" fill="currentColor"/>',
  'internet': '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/><ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" stroke-width="1.25" fill="none"/><path d="M3 12h18M4.5 7h15M4.5 17h15" stroke="currentColor" stroke-width="1.25"/>',
  'social-media': '<circle cx="7" cy="8" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="17" cy="8" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="17" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9.5 10l2 5M14.5 10l-2 5" stroke="currentColor" stroke-width="1.25"/>',
  'smartphones': '<rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="18" r="1" fill="currentColor"/><path d="M10 5h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  'generative-ai': '<path d="M12 3l1.8 5.5L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.5L12 3z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><circle cx="18" cy="5" r="1.5" fill="currentColor"/><circle cx="5" cy="19" r="1.5" fill="currentColor"/>'
};

function techIconSvg(id, size = 24) {
  const inner = TECH_ICONS[id] || '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>';
  return `<svg class="tech-icon-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
}

window.techIconSvg = techIconSvg;
