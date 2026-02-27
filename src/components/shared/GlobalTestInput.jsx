import { IconX } from './icons'

export const GlobalTestInput = ({ value, onChange, placeholder, onFocus, onBlur }) => (
  <div className="global-test-wrap">
    <input
      className="global-test-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      spellCheck={false}
    />
    {value && (
      <button className="icon-btn" onClick={() => onChange('')} title="Clear">
        <IconX />
      </button>
    )}
  </div>
)
