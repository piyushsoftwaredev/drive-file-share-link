
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileDetails from '@/components/FileDetails';
import { useFiles } from '@/contexts/FileContext';

const FileView = () => {
  const { id } = useParams<{ id: string }>();
  const { getFileById } = useFiles();
  const navigate = useNavigate();

  const fileId = id || '';
  const file = getFileById(fileId);

  useEffect(() => {
    if (!file && fileId) {
      // If we can't find the file with this ID, maybe redirect or show an error
      console.error(`File with ID ${fileId} not found`);
    }
  }, [file, fileId]);

  if (!fileId) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <FileDetails fileId={fileId} />
    </div>
  );
};

export default FileView;
