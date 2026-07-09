const Card = ({ 
  children, 
  className = '', 
  title,
  subtitle,
  icon: Icon,
  actions,
  hoverable = false,
  noPadding = false,
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm 
        ${hoverable ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || Icon || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 bg-primary-50 rounded-lg">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
