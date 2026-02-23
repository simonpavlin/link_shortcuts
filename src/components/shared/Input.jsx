export const Input = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  required,
  ...props
}) => (
  <div className={`input-group${className ? ' ' + className : ''}`}>
    {label && (
      <label htmlFor={id} className="input-label">
        {label}
      </label>
    )}
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="input"
      {...props}
    />
  </div>
)
