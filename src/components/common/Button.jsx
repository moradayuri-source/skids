const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  icon: Icon,
  ...props 
}) => {
  const baseStyles = 'inline-flex min-h-10 items-center justify-center rounded-lg font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 disabled:shadow-none';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:-translate-y-0.5 hover:bg-primary-700 focus:ring-primary-100',
    secondary: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:ring-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-100',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-100',
    outline: 'border border-primary-200 bg-white text-primary-700 hover:bg-primary-50 focus:ring-primary-100'
  };

  const sizes = {
    sm: 'min-h-8 px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'min-h-12 px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};

export default Button;
