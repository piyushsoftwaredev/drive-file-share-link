
import React from 'react';

interface FileIconProps {
  type?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FileIcon: React.FC<FileIconProps> = ({ type = 'MKV', size = 'md' }) => {
  // Determine icon color based on file type
  const getIconColor = () => {
    switch (type.toLowerCase()) {
      case 'mkv':
      case 'mp4':
      case 'avi':
        return 'bg-blue-500';
      case 'pdf':
        return 'bg-red-500';
      case 'zip':
      case 'rar':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  return (
    <div className={`${getSizeClasses()} flex flex-col relative rounded overflow-hidden`}>
      <div className="flex-grow bg-white/20 flex items-center justify-center">
        <span className="text-white text-xs font-semibold">{type}</span>
      </div>
      <div className={`h-1/4 ${getIconColor()}`}></div>
    </div>
  );
};

export default FileIcon;
