// Stroke-only SVG icons – 16×16 viewBox, stroke-width 1.5, round caps/joins

export const IconDrag = (props) => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" {...props}>
    <circle cx="3" cy="2.5" r="1" />
    <circle cx="7" cy="2.5" r="1" />
    <circle cx="3"  cy="7"  r="1" />
    <circle cx="7"  cy="7"  r="1" />
    <circle cx="3" cy="11.5" r="1" />
    <circle cx="7" cy="11.5" r="1" />
  </svg>
)

export const IconPencil = (props) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
  </svg>
)

export const IconTrash = (props) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 4h12" />
    <path d="M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1" />
    <path d="M5 4l.8 9h4.4L11 4" />
  </svg>
)

export const IconCheck = (props) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="2 8 6 12 14 4" />
  </svg>
)

export const IconMinus = (props) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
)

export const IconChevronDown = (props) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="4 6 8 10 12 6" />
  </svg>
)

export const IconPlus = (props) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
)

export const IconDownload = (props) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 3v7M5 7l3 3 3-3" />
    <path d="M3 13h10" />
  </svg>
)

export const IconUpload = (props) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 10V3M5 6l3-3 3 3" />
    <path d="M3 13h10" />
  </svg>
)

export const IconLink = (props) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 9a3 3 0 004.24.24L13 7.5A3 3 0 008.76 3.26L7.88 4.14" />
    <path d="M9 7a3 3 0 00-4.24-.24L3 8.5a3 3 0 004.24 4.24l.88-.88" />
  </svg>
)

export const IconArrowRight = (props) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="8" x2="13" y2="8" />
    <polyline points="9 4 13 8 9 12" />
  </svg>
)
