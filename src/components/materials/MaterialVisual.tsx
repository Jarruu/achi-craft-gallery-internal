import * as React from 'react'

export function getColorHex(colorName: string): string {
  const name = colorName.toLowerCase()
  if (name.includes('black')) return '#1A1A1A'
  if (name.includes('white')) return '#FAFAFA'
  if (name.includes('tan') || name.includes('brown')) return '#A77B52'
  if (name.includes('nude') || name.includes('beige')) return '#E3DAC9'
  if (name.includes('gold')) return '#D4AF37'
  if (name.includes('silver') || name.includes('gray')) return '#C0C0C0'
  if (name.includes('red')) return '#A33B3B'
  if (name.includes('blue')) return '#3B59A3'
  if (name.includes('green')) return '#3BA36A'
  if (name.includes('brass')) return '#B5A642'
  if (name.includes('emerald')) return '#50C878' // Fixed sapphire bug to correct emerald green hex
  // Default to a warm gray
  return '#B6B3B3'
}

interface MaterialVisualProps {
  type: string
  colorPattern: string
  imageUrl?: string | null
}

export function MaterialVisual({ type, colorPattern, imageUrl }: MaterialVisualProps) {
  const idPrefix = React.useId().replace(/:/g, '')

  if (imageUrl && imageUrl.trim().startsWith('http')) {
    return (
      <div className="w-full h-40 bg-gallery-split overflow-hidden border-b border-gallery-line relative group">
        <img 
          src={imageUrl} 
          alt={`Foto sampel ${colorPattern}`} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
        />
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gallery-dark text-[10px] tracking-widest text-gallery-base uppercase font-semibold">
          {type}
        </div>
      </div>
    )
  }

  const baseColor = getColorHex(colorPattern)

  return (
    <div className="w-full h-40 bg-gallery-split overflow-hidden border-b border-gallery-line relative flex items-center justify-center p-4">
      {type === 'LEATHER' && (
        <svg className="w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg" aria-label={`Pola kulit warna ${colorPattern}`}>
          <defs>
            <pattern id={`python-${idPrefix}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="none" stroke={`${baseColor}33`} strokeWidth="1" />
              <circle cx="10" cy="10" r="3" fill={baseColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`${baseColor}15`} />
          <rect width="100%" height="100%" fill={`url(#python-${idPrefix})`} />
        </svg>
      )}

      {type === 'FABRIC' && (
        <svg className="w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg" aria-label={`Tekstur tenun warna ${colorPattern}`}>
          <defs>
            <pattern id={`weave-${idPrefix}`} width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0,6 L 12,6 M 6,0 L 6,12" stroke={baseColor} strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`${baseColor}11`} />
          <rect width="100%" height="100%" fill={`url(#weave-${idPrefix})`} />
        </svg>
      )}

      {type === 'ZIPPER' && (
        <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden animate-in fade-in" style={{ backgroundColor: `${baseColor}15` }} aria-label={`Pola ritsleting warna ${colorPattern}`}>
          <div className="w-4 h-full bg-gallery-dark/10 border-x border-gallery-line flex flex-col justify-between py-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full h-1 my-0.5" style={{ backgroundColor: baseColor }} />
            ))}
          </div>
        </div>
      )}

      {type === 'GLUE' && (
        <div className="w-full h-full flex items-center justify-center animate-in fade-in" style={{ backgroundColor: `${baseColor}10` }} aria-label={`Perekat warna ${colorPattern}`}>
          <div className="w-12 h-16 border-2 border-dashed flex items-end justify-center pb-2 relative" style={{ borderColor: baseColor }}>
            <div className="w-full h-1/2" style={{ backgroundColor: baseColor, opacity: 0.3 }} />
            <div className="absolute -top-3 w-4 h-3 border-2 border-b-0" style={{ borderColor: baseColor }} />
          </div>
        </div>
      )}

      {type === 'ACCESSORY' && (
        <svg className="w-full h-full flex items-center justify-center p-8 opacity-80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label={`Aksesoris warna ${colorPattern}`}>
          <circle cx="50" cy="50" r="30" fill="none" stroke={baseColor} strokeWidth="3" />
          <rect x="35" y="35" width="30" height="30" fill="none" stroke={baseColor} strokeWidth="1.5" transform="rotate(45 50 50)" />
        </svg>
      )}

      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gallery-dark text-[10px] tracking-widest text-gallery-base uppercase font-semibold">
        {type}
      </div>
      <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider text-gallery-dark/70 font-bold bg-gallery-base/80 px-2 py-0.5 backdrop-blur-sm">
        {colorPattern}
      </div>
    </div>
  )
}
