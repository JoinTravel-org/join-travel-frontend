import React, { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { Box, Typography, Alert, LinearProgress } from '@mui/material';

registerPlugin(FilePondPluginImagePreview);

interface MediaUploaderProps {
  onFilesChange?: (files: any[]) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onFilesChange }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
  const maxFiles = 10;
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const isFileTypeAccepted = (file: any) => {
    return acceptedTypes.includes(file.type) || acceptedTypes.some(type => file.name.toLowerCase().endsWith(type.split('/')[1]));
  };

  const handleUpdateFiles = (fileItems: any[]) => {
    // Check if we exceed max files limit
    if (fileItems.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos permitidos.`);
      setTimeout(() => setError(''), 3000);
      setFiles(fileItems.slice(0, maxFiles));
      return;
    }

    const invalidFiles = fileItems.filter((fileItem) => {
      const file = fileItem.file;
      return file.size > maxFileSize || !isFileTypeAccepted(file);
    });

    if (invalidFiles.length > 0) {
      setFiles(fileItems.filter((fileItem) => !invalidFiles.includes(fileItem)));
      return;
    }

    setFiles(fileItems);
    if (onFilesChange) {
      onFilesChange(fileItems);
    }
  };

  const handleFileAdd = (error: any, file: any) => {
    if (error) {
      setError('Archivo demasiado grande.');
      setTimeout(() => setError(''), 2000);
    } else {
      const f = file.file;
      if (f.size > maxFileSize) {
        setError(`Archivo demasiado grande. Máximo ${maxFileSize / (1024 * 1024)}MB por archivo.`);
        setTimeout(() => setError(''), 3000);
      } else if (!isFileTypeAccepted(f)) {
        setError('Formato de archivo no aceptado. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP) y videos (MP4, MOV).');
        setTimeout(() => setError(''), 3000);
      } else {
        // Simular progreso para archivos grandes válidos
        if (f.size > 1024 * 1024) { // >1MB
          setIsProcessing(true);
          setProgress(0);
          const interval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 100) {
                clearInterval(interval);
                setIsProcessing(false);
                return 100;
              }
              return prev + 10;
            });
          }, 100);
        }
      }
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Arrastra y suelta fotos (JPEG, PNG, GIF, WEBP) o videos (MP4, MOV) aquí, o haz clic para seleccionar.
        <br />
        Máximo {maxFiles} archivos, {maxFileSize / (1024 * 1024)}MB cada uno.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {isProcessing && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">Procesando archivo...</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
      <FilePond
        files={files}
        onupdatefiles={handleUpdateFiles}
        onaddfile={handleFileAdd}
        allowMultiple={true}
        maxFiles={maxFiles}
        acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']}
        labelIdle='📷 Arrastra y suelta tus archivos o <span class="filepond--label-action">Buscar en Dispositivo</span>'
        stylePanelLayout="compact"
        styleLoadIndicatorPosition="center bottom"
        styleProgressIndicatorPosition="right bottom"
        styleButtonRemoveItemPosition="left bottom"
        styleButtonProcessItemPosition="right bottom"
      />
    </Box>
  );
};

export default MediaUploader;