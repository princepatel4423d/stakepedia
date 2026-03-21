import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/api/index'

const ImageUploader = ({
  value,
  onChange,
  folder = 'general',
  label = 'Upload image',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSizeMB = 5,
  className,
  aspectRatio,
}) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef(null)

  const upload = useCallback(async (file) => {
    if (!file) return
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be under ${maxSizeMB}MB`)
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      // Pass folder as query param so server uploads to correct Cloudinary folder
      const res = await api.post(`/uploads/image?folder=${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(res.data.data.url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [folder, maxSizeMB, onChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [upload])

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative group inline-block">
          <img
            src={value}
            alt="Uploaded"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className={cn(
              'object-cover rounded-lg border bg-muted',
              aspectRatio === '16:9' ? 'w-full h-48' : 'h-32 w-32'
            )}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors',
            aspectRatio === '16:9' ? 'w-full h-48' : 'h-32 w-32',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs text-center px-2">{label}</span>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => upload(e.target.files[0])}
      />
    </div>
  )
}

export default ImageUploader