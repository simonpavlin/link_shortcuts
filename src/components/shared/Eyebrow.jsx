/**
 * Eyebrow section header.
 * - `right`   – optional element rendered after the growing line (e.g. icon button)
 * - `onClick` – makes the whole row a click target (for collapse toggles)
 */
export const Eyebrow = ({ children, right, onClick }) => (
  <div
    className={`eyebrow${onClick ? ' eyebrow-btn' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
  >
    <div className="eyebrow-line" />
    <span className="eyebrow-text">{children}</span>
    <div className="eyebrow-line eyebrow-line-grow" />
    {right && <div className="eyebrow-action">{right}</div>}
  </div>
)
