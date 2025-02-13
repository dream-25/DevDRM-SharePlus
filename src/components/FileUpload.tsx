import React, { useState, useRef, useEffect } from 'react';
import { Upload, Check, Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  shareLink?: string;
}

interface UploadRecord {
  datetime: string;
  filename: string;
  size: number;
  shareLink: string;
}

const FileUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const history = localStorage.getItem('uploadHistory');
    if (history) {
      setUploadHistory(JSON.parse(history));
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const formData = new FormData();
    formData.append('file', files[0]);

    setUploadState({ status: 'uploading', progress: 0 });

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/server.php', true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const bytesSent = e.loaded;
          const totalSize = e.total;
          const progress = Math.round((bytesSent / totalSize) * 100);
          setUploadState(prev => ({ ...prev, progress: Math.min(progress, 99) }));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          const shareLink = `${window.location.origin}${data.shareLink}`;
          
          setUploadState({
            status: 'success',
            progress: 100,
            shareLink
          });

          // Add to history
          const newRecord: UploadRecord = {
            datetime: new Date().toISOString(),
            filename: files[0].name,
            size: files[0].size,
            shareLink
          };

          const updatedHistory = [newRecord, ...uploadHistory].slice(0, 10);
          setUploadHistory(updatedHistory);
          localStorage.setItem('uploadHistory', JSON.stringify(updatedHistory));
          
          toast.success('File uploaded successfully!');
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };

      xhr.send(formData);
    } catch (error) {
      setUploadState({ status: 'error', progress: 0 });
      toast.error('Failed to upload file');
    }
  };

  const copyToClipboard = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      <div
        className={`drop-zone rounded-lg p-8 text-center ${
          isDragging ? 'dragging' : ''
        } ${uploadState.status === 'uploading' ? 'opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploadState.status === 'idle' && (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">Drop your file here</p>
              <p className="text-sm text-gray-500">or click to select</p>
            </div>
          </div>
        )}

        {uploadState.status === 'uploading' && (
          <div className="space-y-4">
            <div className="w-full max-w-xs mx-auto">
              <Progress value={uploadState.progress} className="w-full" />
            </div>
            <p className="text-sm text-gray-500">
              Uploading... {uploadState.progress}%
            </p>
          </div>
        )}

        {uploadState.status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
            <p className="text-red-500">Upload failed. Please try again.</p>
          </div>
        )}
      </div>

      {uploadState.status === 'success' && uploadState.shareLink && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between space-x-2">
            <input
              type="text"
              value={uploadState.shareLink}
              readOnly
              className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
            />
            <button
              onClick={() => copyToClipboard(uploadState.shareLink!)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {uploadHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Upload History</h2>
          <div className="space-y-4">
            {uploadHistory.map((record, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{record.filename}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(record.datetime))} ago • {formatFileSize(record.size)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(record.shareLink)}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <a
                      href={record.shareLink}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      download
                    >
                      <Upload className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;