import { IoDocumentTextOutline } from 'react-icons/io5';

const imageFormats = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']);

const fileFormat = (url, format) => {
  if (format) return String(format).toLowerCase();
  return String(url || '').split('?')[0].split('.').pop()?.toLowerCase() || '';
};

const FilePreview = ({ url, format, title, className = '' }) => {
  const detectedFormat = fileFormat(url, format);

  if (url && imageFormats.has(detectedFormat)) {
    return <img src={url} alt={title || 'File preview'} className={`object-cover ${className}`} />;
  }

  if (url && detectedFormat === 'pdf') {
    return (
      <iframe
        src={`${url}#toolbar=0&navpanes=0`}
        title={`${title || 'PDF'} preview`}
        className={`bg-white ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
      <IoDocumentTextOutline className="h-12 w-12" />
    </div>
  );
};

export default FilePreview;
