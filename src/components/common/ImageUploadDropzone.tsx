import React, { useRef, useState } from 'react';
import { Upload, Camera, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface ImageUploadDropzoneProps {
  value?: string;
  onChange: (dataUrl: string, fileName?: string) => void;
  onRemove?: () => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'video' | 'square' | 'cover' | 'auto';
  isAvatar?: boolean;
  compact?: boolean;
  buttonText?: string;
  className?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  value,
  onChange,
  onRemove,
  label,
  helperText = 'Drag & drop image here, or browse from device / camera',
  aspectRatio = 'video',
  isAvatar = false,
  compact = false,
  buttonText = 'Choose Photo / Camera',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP, GIF, HEIC).');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onChange(e.target.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so re-selecting same file triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'cover'
      ? 'aspect-[21/9] sm:aspect-[24/9]'
      : 'aspect-auto min-h-[140px]';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-[#aaaaaa] flex items-center gap-1.5 font-bold">
            <Camera className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>{label}</span>
          </label>
          {fileName && (
            <span className="text-[10px] font-mono text-[#888888] truncate max-w-[150px]">
              {fileName}
            </span>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview with Replace / Remove controls */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group bg-[#111111] border overflow-hidden transition-all ${
            isDragOver ? 'border-[#C8102E] ring-2 ring-[#C8102E]' : 'border-[#444444]'
          } ${isAvatar ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto' : `w-full ${aspectClass}`}`}
        >
          <img
            src={value}
            alt="Uploaded Preview"
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
              isAvatar ? 'rounded-full' : ''
            }`}
          />

          {/* Quick Action Overlay (Touch & Desktop friendly) */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white text-[11px] font-['Oswald'] uppercase font-bold tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Change Photo</span>
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName(null);
                  onRemove();
                }}
                className="px-2.5 py-1 bg-black/80 hover:bg-black text-[#cccccc] hover:text-white border border-[#444444] text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3 text-[#C8102E]" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {/* Mobile action button pill fixed at bottom corner */}
          <div className="sm:hidden absolute bottom-1.5 right-1.5 flex gap-1 z-10">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 bg-[#C8102E] text-white text-[10px] font-mono uppercase tracking-wider font-bold shadow-md cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Change</span>
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName(null);
                  onRemove();
                }}
                className="p-1 bg-black/80 text-white border border-[#444444] cursor-pointer"
                title="Remove"
              >
                <Trash2 className="w-3 h-3 text-[#C8102E]" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty Dropzone / Upload Box */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
            isDragOver
              ? 'border-[#C8102E] bg-[#C8102E]/10'
              : 'border-[#444444] hover:border-[#C8102E] bg-[#1a1a1a] hover:bg-[#202020]'
          } ${
            compact
              ? 'p-3 gap-1.5'
              : isAvatar
              ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-full p-2 mx-auto'
              : `p-4 sm:p-6 gap-2 w-full ${aspectClass}`
          }`}
        >
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-[#252525] border border-[#3d3d3d] text-[#C8102E] group-hover:scale-105 transition-transform">
            {isAvatar ? <Camera className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          </div>

          <div className="space-y-0.5">
            <p className="font-['Oswald'] text-xs sm:text-sm uppercase text-white font-bold tracking-wider">
              {buttonText}
            </p>
            {!compact && (
              <p className="text-[10px] sm:text-[11px] text-[#888888] font-mono px-2 line-clamp-2">
                {helperText}
              </p>
            )}
          </div>

          {/* Explicit mobile/touch upload button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-1 px-3 py-1 sm:px-4 sm:py-1.5 bg-[#C8102E] hover:bg-[#e01334] text-white font-['Oswald'] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Camera className="w-3 h-3" />
            <span>Upload Photo</span>
          </button>
        </div>
      )}
    </div>
  );
};
