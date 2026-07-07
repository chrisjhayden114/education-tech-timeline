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
  'generative-ai': '<path d="M12 3l1.8 5.5L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.5L12 3z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><circle cx="18" cy="5" r="1.5" fill="currentColor"/><circle cx="5" cy="19" r="1.5" fill="currentColor"/>',
  paper: '<rect x="5" y="3" width="14" height="18" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  'hindu-arabic-numerals': '<path d="M7 7h3v10H7zM14 7h3v10h-3zM10 12h4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  'handwriting-technologies-slates-to-ballpoints-typewriter': '<rect x="4" y="5" width="16" height="12" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 9h10M7 12h7M7 15h5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  chess: '<path d="M8 20h8M10 4h4v3h-4zM9 7h6l-1 4H10l-1 4h6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  'penny-dreadfuls-and-dime-novels': '<path d="M5 4h6v16H5a1 1 0 01-1-1V5a1 1 0 011-1zm8 0h6a1 1 0 011 1v14a1 1 0 01-1 1h-6V4z" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  'phonograph-and-player-piano': '<circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 5v2M12 17v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  'sunday-comic-strips': '<rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 10h18M7 10v9M12 10v9M17 10v9" stroke="currentColor" stroke-width="1.25"/>',
  'crossword-puzzles': '<rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10 4v16M4 10h16M16 4v7M4 16h7" stroke="currentColor" stroke-width="1.25"/>',
  'automation-cybernation': '<rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 10h8M8 14h5M9 6V4M15 6V4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  photocopier: '<rect x="5" y="4" width="14" height="16" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="8" y="14" width="8" height="4" rx="1" stroke="currentColor" stroke-width="1.25" fill="none"/>',
  walkman: '<rect x="6" y="7" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="9" cy="12" r="2" stroke="currentColor" stroke-width="1.25" fill="none"/><path d="M14 10v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  pagers: '<rect x="7" y="4" width="10" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="9" y="7" width="6" height="4" rx="1" fill="currentColor" opacity="0.5"/>',
  'mobile-phone-wi-fi-and-5g-radiation': '<path d="M8 18a8 8 0 0116 0M10 15a5 5 0 0110 0M12 12a2 2 0 014 0" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><rect x="9" y="2" width="6" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  'virtual-reality': '<path d="M3 10h5l2-3h4l2 3h5v6h-5l-2 3h-4l-2-3H3z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  'texting-and-instant-messaging': '<rect x="3" y="5" width="18" height="12" rx="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 11h6M7 14h10" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>',
  wikipedia: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 7v10M9 10h6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
  'gps-navigation': '<path d="M12 3l3 8h8l-6.5 5 2.5 8L12 18l-7 6 2.5-8L1 11h8z" stroke="currentColor" stroke-width="1.25" fill="none" stroke-linejoin="round"/>',
  'search-engines': '<circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
  '3d-printing': '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke="currentColor" stroke-width="1.25"/>',
  'smart-speakers-and-voice-assistants': '<rect x="6" y="8" width="12" height="10" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 6a3 3 0 016 0" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  'fidget-spinners': '<circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
};

function techIconSvg(id, size = 24) {
  const inner = TECH_ICONS[id] || '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>';
  return `<svg class="tech-icon-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
}

window.techIconSvg = techIconSvg;
