/**
 * PHOTO UPLOAD — Browser-based image compression
 * FREE — No S3, No Cloudinary needed!
 */

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage } from '@/utils/free-features';

interface PhotoUploadProps {
  currentPhoto?: string | null;
  onUpload: (base64: string) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
}

export const PhotoUpload = ({
  currentPhoto,
  onUpload,
  size = 'lg',
  shape = 'circle',
}: PhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);

  const sizes = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-32 h-32' };
  const shapes = { circle: 'rounded-full', square: 'rounded-2xl' };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only images allowed');
      return;
    }

    setUploading(true);
    try {
      // Compress to max 800px, 70% quality — FREE!
      const compressed = await compressImage(file, 800, 0.7);
      const sizeKb = Math.round(compressed.length / 1024);

      if (sizeKb > 1024) {
        toast.error(`Image too large: ${sizeKb}KB. Try smaller image.`);
        setUploading(false);
        return;
      }

      setPreview(compressed);
      await onUpload(compressed);
      toast.success(`Photo uploaded (${sizeKb}KB) ✅`);
    } catch (err: any) {
      toast.error('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="inline-block relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div
        onClick={() => inputRef.current?.click()}
        className={`${sizes[size]} ${shapes[shape]} relative overflow-hidden cursor-pointer group bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-zinc-900`}
      >
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">👤</span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera size={28} className="text-white" />
        </div>

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Edit button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-zinc-800 text-primary-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center shadow-md disabled:opacity-50"
      >
        <Camera size={14} />
      </button>
    </div>
  );
};
