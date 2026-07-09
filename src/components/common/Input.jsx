import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  helper,
  className = '',
  disabled = false,
  required = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseStyles = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200';
  
  const variantStyles = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : success
    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';

  const iconStyles = Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            ${baseStyles}
            ${variantStyles}
            ${iconStyles}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      {helper && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-1 text-sm text-green-600">{success}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
