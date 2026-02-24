// Deterministic hue from tag string using golden-angle distribution
function tagHue(tag) {
  let h = 0
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return (h * 137) % 360
}

export const TagBadge = ({ tag, onRemove }) => {
  const hue = tagHue(tag)
  return (
    <span className="tag-badge" style={{ '--tag-hue': hue }}>
      {tag}
      {onRemove && (
        <button
          className="tag-badge-remove"
          type="button"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
        >
          ×
        </button>
      )}
    </span>
  )
}
