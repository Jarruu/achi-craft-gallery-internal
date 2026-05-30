import { useRef, useEffect, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadInputProps {
  existingUrl?: string | null | undefined
  file: File | null
  onFileChange: (file: File | null) => void
  onClearExisting?: () => void
  label: string
}

export function ImageUploadInput({
  existingUrl,
  file,
  onFileChange,
  onClearExisting,
  label
}: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Create local object URL for preview when file is selected
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Format berkas tidak didukung', {
        description: 'Silakan pilih berkas gambar (JPG, PNG, dll.).',
      })
      return
    }

    // Validate size (e.g. 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Berkas terlalu besar', {
        description: 'Maksimum ukuran gambar adalah 5MB.',
      })
      return
    }

    onFileChange(selectedFile)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearLocal = (e: React.MouseEvent) => {
    e.preventDefault()
    onFileChange(null)
  }

  const handleClearExisting = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClearExisting) {
      onClearExisting()
    }
  }

  return (
    <div className="space-y-1 font-sans w-full">
      <label className="text-[9px] uppercase tracking-[0.2em] text-gallery-muted font-bold block">
        {label}
      </label>
      
      {previewUrl ? (
        /* COMPACT LOCAL PREVIEW FRAME */
        <div className="relative border-[0.5px] border-gallery-line bg-[#E7E3E3]/40 flex flex-row items-center gap-3 p-2.5 min-h-[70px] group transition-all duration-300">
          <img 
            src={previewUrl} 
            alt="Preview Lokal" 
            className="w-12 h-12 object-contain border-[0.5px] border-gallery-line bg-white shrink-0"
          />
          
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-[9px] text-gallery-dark font-mono font-semibold truncate leading-tight select-all">
              {file?.name}
            </p>
          </div>

          <button
            onClick={handleClearLocal}
            className="absolute top-2 right-2 p-1 bg-[#2E2D31] text-[#F3F1F1] hover:bg-red-700 transition-colors duration-200 flex items-center justify-center cursor-pointer"
            title="Batal Pilih Gambar"
          >
            <X size={10} />
          </button>
        </div>
      ) : existingUrl ? (
        /* COMPACT EXISTING DATABASE PREVIEW FRAME */
        <div className="relative border-[0.5px] border-gallery-line bg-[#E7E3E3]/40 flex flex-row items-center gap-3 p-2.5 min-h-[70px] group transition-all duration-300">
          <img 
            src={existingUrl} 
            alt="Preview Eksisting" 
            className="w-12 h-12 object-contain border-[0.5px] border-gallery-line bg-white shrink-0"
          />
          
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-[9px] text-gallery-dark font-mono truncate leading-tight select-all">
              {existingUrl}
            </p>
            <p className="text-[7px] text-green-700 tracking-wider uppercase font-bold mt-0.5 leading-none">
              Gambar Terunggah Aktif
            </p>
          </div>

          <button
            onClick={handleClearExisting}
            className="absolute top-2 right-2 p-1 bg-[#2E2D31] text-[#F3F1F1] hover:bg-red-700 transition-colors duration-200 flex items-center justify-center cursor-pointer"
            title="Hapus Gambar"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        /* COMPACT FILE DROPZONE / UPLOADER SELECTOR */
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-[0.5px] border-dashed border-gallery-line bg-[#E7E3E3]/20 hover:bg-[#E7E3E3]/45 hover:border-gallery-dark p-3 flex flex-row items-center justify-center gap-2 transition-all duration-300 cursor-pointer group min-h-[50px] font-sans"
          >
            <Upload size={14} className="text-gallery-muted group-hover:text-gallery-dark transition-colors duration-300 shrink-0" />
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-[0.15em] text-gallery-dark font-bold block leading-none group-hover:underline">
                PILIH BERKAS FOTO
              </span>
              <span className="text-[7px] text-gallery-muted tracking-wider block mt-0.5 uppercase font-semibold leading-none">
                PNG, JPG, JPEG (Maks. 5MB)
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

export async function uploadToImgBB(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY
  if (!apiKey) {
    throw new Error('API Key ImgBB belum dikonfigurasi. Silakan tambahkan VITE_IMGBB_API_KEY di file .env.local.')
  }

  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData?.error?.message || 'Gagal mengunggah gambar.')
  }

  const result = await response.json()
  if (result.success && result.data?.url) {
    return result.data.url
  } else {
    throw new Error('Respon dari API ImgBB tidak valid.')
  }
}
