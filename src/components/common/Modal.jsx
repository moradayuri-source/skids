import { useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnOverlayClick]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px] transition-opacity" />
        
        <div
          ref={modalRef}
          className={`
            relative w-full overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl
            ${sizeClasses[size]}
            ${className}
          `}
          {...props}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              {title && (
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 transition-colors duration-200 hover:bg-slate-100"
                >
                  <IoClose className="w-6 h-6 text-gray-500" />
                </button>
              )}
            </div>
          )}
          
          <div className="max-h-[calc(100vh-7rem)] overflow-y-auto p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
