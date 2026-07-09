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
        rounded-xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.04)]
        ${hoverable ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg' : ''}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || Icon || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="rounded-lg bg-primary-50 p-2">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
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
