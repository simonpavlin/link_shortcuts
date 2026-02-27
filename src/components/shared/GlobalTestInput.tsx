import { IconX } from './icons'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onFocus?: () => void
  onBlur?: () => void
}

export const GlobalTestInput = ({ value, onChange, placeholder, onFocus, onBlur }: Props) => (
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
