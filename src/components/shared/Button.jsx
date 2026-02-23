export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled,
  className = '',
  title,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`btn btn-${variant} btn-${size}${className ? ' ' + className : ''}`}
  >
    {children}
  </button>
)
