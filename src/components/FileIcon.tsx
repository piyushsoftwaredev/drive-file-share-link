
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
      case 'mov':
        return 'bg-blue-600';
      case 'pdf':
        return 'bg-red-600';
      case 'doc':
      case 'docx':
        return 'bg-blue-800';
      case 'xls':
      case 'xlsx':
        return 'bg-green-600';
      case 'zip':
      case 'rar':
        return 'bg-yellow-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
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
    <div className={`${getSizeClasses()} flex flex-col relative rounded overflow-hidden shadow-lg`}>
      <div className="flex-grow bg-[#1a1725] flex items-center justify-center border border-[#2a2440]">
        <span className="text-white text-xs font-semibold">{type}</span>
      </div>
      <div className={`h-1/4 ${getIconColor()}`}></div>
    </div>
  );
};

export default FileIcon;
