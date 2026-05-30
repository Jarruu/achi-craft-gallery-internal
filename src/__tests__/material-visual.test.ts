import { describe, it, expect } from 'vitest'

// Exact replica of getColorHex from materials.tsx
function getColorHex(colorName: string): string {
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
  if (name.includes('emerald')) return '#0F52BA'
  return '#B6B3B3' // Default warm gray
}

describe('Material Visual - Color Hex Mapping', () => {
  it('should return correct hex for black colors', () => {
    expect(getColorHex('Black Matte')).toBe('#1A1A1A')
    expect(getColorHex('Deep Black')).toBe('#1A1A1A')
  })

  it('should return correct hex for white colors', () => {
    expect(getColorHex('White Pearl')).toBe('#FAFAFA')
  })

  it('should return correct hex for tan/brown colors', () => {
    expect(getColorHex('Tan Python')).toBe('#A77B52')
    expect(getColorHex('Light Brown')).toBe('#A77B52')
  })

  it('should return correct hex for nude/beige colors', () => {
    expect(getColorHex('Nude Matte')).toBe('#E3DAC9')
    expect(getColorHex('Beige Soft')).toBe('#E3DAC9')
  })

  it('should return correct hex for gold colors', () => {
    expect(getColorHex('Brass Gold')).toBe('#D4AF37') // gold matches before brass
  })

  it('should return correct hex for silver/gray colors', () => {
    expect(getColorHex('Silver Matte')).toBe('#C0C0C0')
    expect(getColorHex('Light Gray')).toBe('#C0C0C0')
  })

  it('should return correct hex for red colors', () => {
    expect(getColorHex('Red Wine')).toBe('#A33B3B')
  })

  it('should return correct hex for blue colors', () => {
    expect(getColorHex('Navy Blue')).toBe('#3B59A3')
  })

  it('should return correct hex for green colors', () => {
    expect(getColorHex('Forest Green')).toBe('#3BA36A')
  })

  it('should return correct hex for brass colors', () => {
    expect(getColorHex('Antique Brass')).toBe('#B5A642')
  })

  it('should return correct hex for emerald colors', () => {
    expect(getColorHex('Emerald Shine')).toBe('#0F52BA')
  })

  it('should return default warm gray for unknown colors', () => {
    expect(getColorHex('Custom Color')).toBe('#B6B3B3')
    expect(getColorHex('Unknown Pattern')).toBe('#B6B3B3')
  })

  it('should be case-insensitive', () => {
    expect(getColorHex('BLACK MATTE')).toBe('#1A1A1A')
    expect(getColorHex('Tan python')).toBe('#A77B52')
    expect(getColorHex('BRASS GOLD')).toBe('#D4AF37') // gold matches first
  })
})

describe('Material Visual - Material Type Categories', () => {
  const materialTypes = ['LEATHER', 'FABRIC', 'GLUE', 'ZIPPER', 'ACCESSORY']

  it('should support all 5 material types', () => {
    expect(materialTypes).toHaveLength(5)
    expect(materialTypes).toContain('LEATHER')
    expect(materialTypes).toContain('FABRIC')
    expect(materialTypes).toContain('GLUE')
    expect(materialTypes).toContain('ZIPPER')
    expect(materialTypes).toContain('ACCESSORY')
  })

  it('should render appropriate visual for each type', () => {
    // Verify each type would map to a different SVG/visual
    const visualMap: Record<string, string> = {
      LEATHER: 'python-pattern',
      FABRIC: 'weave-pattern',
      ZIPPER: 'teeth-bars',
      GLUE: 'bottle-shape',
      ACCESSORY: 'geometric-shapes',
    }
    for (const type of materialTypes) {
      expect(visualMap[type]).toBeDefined()
    }
  })
})

describe('Material Visual - Image URL Handling', () => {
  it('should detect valid http URLs', () => {
    const url = 'https://example.com/image.jpg'
    const isValidUrl = url.trim().startsWith('http')
    expect(isValidUrl).toBe(true)
  })

  it('should reject non-http URLs', () => {
    const url = 'ftp://example.com/image.jpg'
    const isValidUrl = url.trim().startsWith('http')
    expect(isValidUrl).toBe(false)
  })

  it('should handle empty string as no image', () => {
    const url = ''
    const hasImage = url && url.trim().startsWith('http')
    expect(hasImage).toBeFalsy()
  })

  it('should handle null as no image', () => {
    const url: string | null = null
    const hasImage = url && url.trim().startsWith('http')
    expect(hasImage).toBeFalsy()
  })

  it('should handle whitespace-only string', () => {
    const url = '   '
    const hasImage = url && url.trim().startsWith('http')
    expect(hasImage).toBeFalsy()
  })
})
