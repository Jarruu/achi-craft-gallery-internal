import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import { ImageUploadInput } from '../ImageUploadInput'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

interface MaterialFormDialogsProps {
  // Options
  options: {
    types: any[]
    categories: any[]
    qualities: any[]
    units: any[]
  }
  
  // Create Dialog State
  isAdding: boolean
  setIsAdding: (open: boolean) => void
  newMaterial: any
  setNewMaterial: (m: any) => void
  newMaterialFile: File | null
  setNewMaterialFile: (file: File | null) => void
  isSavingNew: boolean
  handleAddSubmit: (e: React.FormEvent) => void

  // Edit Dialog State
  isEditing: boolean
  setIsEditing: (open: boolean) => void
  editMaterialData: any
  setEditMaterialData: (m: any) => void
  editMaterialFile: File | null
  setEditMaterialFile: (file: File | null) => void
  isSavingEdit: boolean
  handleEditSubmit: (e: React.FormEvent) => void

  // Delete Dialog State
  isDeletingOpen: boolean
  setIsDeletingOpen: (open: boolean) => void
  selectedMaterial: any
  isDeleting: boolean
  handleDeleteMaterial: () => void

  // Inline Option Add Helpers
  isAddingTypeInline: boolean
  setIsAddingTypeInline: (adding: boolean) => void
  inlineTypeValue: string
  setInlineTypeValue: (val: string) => void
  handleSaveTypeInline: () => void

  isAddingCategoryInline: boolean
  setIsAddingCategoryInline: (adding: boolean) => void
  inlineCategoryValue: string
  setInlineCategoryValue: (val: string) => void
  handleSaveCategoryInline: () => void

  isAddingQualityInline: boolean
  setIsAddingQualityInline: (adding: boolean) => void
  inlineQualityValue: string
  setInlineQualityValue: (val: string) => void
  handleSaveQualityInline: () => void

  isAddingUnitInline: boolean
  setIsAddingUnitInline: (adding: boolean) => void
  inlineUnitValue: string
  setInlineUnitValue: (val: string) => void
  handleSaveUnitInline: () => void
}

export function MaterialFormDialogs({
  options,
  isAdding,
  setIsAdding,
  newMaterial,
  setNewMaterial,
  newMaterialFile,
  setNewMaterialFile,
  isSavingNew,
  handleAddSubmit,
  isEditing,
  setIsEditing,
  editMaterialData,
  setEditMaterialData,
  editMaterialFile,
  setEditMaterialFile,
  isSavingEdit,
  handleEditSubmit,
  isDeletingOpen,
  setIsDeletingOpen,
  selectedMaterial,
  isDeleting,
  handleDeleteMaterial,
  isAddingTypeInline,
  setIsAddingTypeInline,
  inlineTypeValue,
  setInlineTypeValue,
  handleSaveTypeInline,
  isAddingCategoryInline,
  setIsAddingCategoryInline,
  inlineCategoryValue,
  setInlineCategoryValue,
  handleSaveCategoryInline,
  isAddingQualityInline,
  setIsAddingQualityInline,
  inlineQualityValue,
  setInlineQualityValue,
  handleSaveQualityInline,
  isAddingUnitInline,
  setIsAddingUnitInline,
  inlineUnitValue,
  setInlineUnitValue,
  handleSaveUnitInline
}: MaterialFormDialogsProps) {
  
  return (
    <>
      {/* ADD DIALOG */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>TAMBAH BAHAN BAKU BARU</DialogTitle>
            <DialogDescription>
              Silakan lengkapi formulir di bawah ini untuk mendaftarkan bahan baku baru ke dalam sistem inventaris.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 font-sans">
            <ImageUploadInput
              label="Foto Bahan Baku"
              existingUrl={newMaterial.imageUrl}
              file={newMaterialFile}
              onFileChange={setNewMaterialFile}
              onClearExisting={() => setNewMaterial({ ...newMaterial, imageUrl: '' })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="add-sku" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Kode SKU*
                </label>
                <input 
                  id="add-sku"
                  type="text" 
                  required 
                  disabled={isSavingNew}
                  placeholder="e.g. LTH-SYN-BK01"
                  value={newMaterial.sku}
                  onChange={(e) => setNewMaterial({...newMaterial, sku: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="add-name" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Nama Bahan Baku*
                </label>
                <input 
                  id="add-name"
                  type="text" 
                  required 
                  disabled={isSavingNew}
                  placeholder="e.g. Synthetic Nappa Suede"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="add-type-select" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Jenis Bahan*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTypeInline(!isAddingTypeInline)
                      setInlineTypeValue('')
                    }}
                    className="text-[10px] text-gallery-dark font-bold hover:underline cursor-pointer focus-ring"
                  >
                    {isAddingTypeInline ? 'Batal' : '+ Tambah'}
                  </button>
                </div>
                {isAddingTypeInline ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      id="add-type-inline"
                      type="text"
                      required
                      placeholder="Jenis"
                      value={inlineTypeValue}
                      onChange={(e) => setInlineTypeValue(e.target.value)}
                      className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus-ring font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTypeInline}
                      className="w-full bg-gallery-dark text-gallery-base py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer text-center focus-ring"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select 
                    id="add-type-select"
                    disabled={isSavingNew}
                    value={newMaterial.type}
                    onChange={(e) => {
                      const t = e.target.value
                      let u = 'feet'
                      if (t === 'FABRIC') u = 'meter'
                      if (t === 'GLUE') u = 'ml'
                      if (t === 'ZIPPER') u = 'pcs'
                      if (t === 'ACCESSORY') u = 'pcs'
                      
                      const matchUnit = options.units.find(un => un.name === u)
                      const unitVal = matchUnit ? matchUnit.name : (options.units[0]?.name || u)

                      setNewMaterial({...newMaterial, type: t, unit: unitVal})
                    }}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide uppercase disabled:opacity-50"
                  >
                    {options.types.map(t => (
                      <option key={t.id} value={t.name}>{t.label || t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="add-category-select" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Kategori*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategoryInline(!isAddingCategoryInline)
                      setInlineCategoryValue('')
                    }}
                    className="text-[10px] text-gallery-dark font-bold hover:underline cursor-pointer focus-ring"
                  >
                    {isAddingCategoryInline ? 'Batal' : '+ Tambah'}
                  </button>
                </div>
                {isAddingCategoryInline ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      id="add-category-inline"
                      type="text"
                      required
                      placeholder="Kategori"
                      value={inlineCategoryValue}
                      onChange={(e) => setInlineCategoryValue(e.target.value)}
                      className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus-ring font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCategoryInline}
                      className="w-full bg-gallery-dark text-gallery-base py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer text-center focus-ring"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select 
                    id="add-category-select"
                    required 
                    disabled={isSavingNew}
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide disabled:opacity-50"
                  >
                    {options.categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="add-quality-select" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Kualitas*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingQualityInline(!isAddingQualityInline)
                      setInlineQualityValue('')
                    }}
                    className="text-[10px] text-gallery-dark font-bold hover:underline cursor-pointer focus-ring"
                  >
                    {isAddingQualityInline ? 'Batal' : '+ Tambah'}
                  </button>
                </div>
                {isAddingQualityInline ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      id="add-quality-inline"
                      type="text"
                      required
                      placeholder="Kualitas"
                      value={inlineQualityValue}
                      onChange={(e) => setInlineQualityValue(e.target.value)}
                      className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus-ring font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveQualityInline}
                      className="w-full bg-gallery-dark text-gallery-base py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer text-center focus-ring"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select 
                    id="add-quality-select"
                    required 
                    disabled={isSavingNew}
                    value={newMaterial.quality}
                    onChange={(e) => setNewMaterial({...newMaterial, quality: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide disabled:opacity-50"
                  >
                    {options.qualities.map(q => (
                      <option key={q.id} value={q.name}>{q.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="add-color" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Warna / Motif*
                </label>
                <input 
                  id="add-color"
                  type="text" 
                  required 
                  disabled={isSavingNew}
                  placeholder="e.g. Python Gold, Matte Slate Black"
                  value={newMaterial.colorPattern}
                  onChange={(e) => setNewMaterial({...newMaterial, colorPattern: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="add-size" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Ukuran / Detail Fisik*
                </label>
                <input 
                  id="add-size"
                  type="text" 
                  required 
                  disabled={isSavingNew}
                  placeholder="e.g. Gulungan, Botol, Lembar, Pcs"
                  value={newMaterial.size}
                  onChange={(e) => setNewMaterial({...newMaterial, size: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="add-stock" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Stok Awal*
                </label>
                <input 
                  id="add-stock"
                  type="number" 
                  step="any"
                  required 
                  disabled={isSavingNew}
                  value={newMaterial.stock}
                  onChange={(e) => setNewMaterial({...newMaterial, stock: Number(e.target.value)})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="add-unit-select" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Satuan*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingUnitInline(!isAddingUnitInline)
                      setInlineUnitValue('')
                    }}
                    className="text-[10px] text-gallery-dark font-bold hover:underline cursor-pointer focus-ring"
                  >
                    {isAddingUnitInline ? 'Batal' : '+ Tambah'}
                  </button>
                </div>
                {isAddingUnitInline ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      id="add-unit-inline"
                      type="text"
                      required
                      placeholder="Pcs"
                      value={inlineUnitValue}
                      onChange={(e) => setInlineUnitValue(e.target.value)}
                      className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus-ring font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveUnitInline}
                      className="w-full bg-gallery-dark text-gallery-base py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer text-center focus-ring"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select 
                    id="add-unit-select"
                    required 
                    disabled={isSavingNew}
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide disabled:opacity-50"
                  >
                    {options.units.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="add-expiry" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Tgl Kedaluwarsa
                </label>
                <input 
                  id="add-expiry"
                  type="date" 
                  disabled={isSavingNew}
                  placeholder="Opsional"
                  value={newMaterial.expiredAt || ''}
                  onChange={(e) => setNewMaterial({...newMaterial, expiredAt: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border-[0.5px] border-gallery-line bg-gallery-split hover:bg-gallery-base text-gallery-muted hover:text-gallery-dark text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer focus-ring"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSavingNew}
                className="bg-gallery-dark text-gallery-base py-2 px-5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus-ring"
              >
                {isSavingNew ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Menyimpan Bahan...</span>
                  </>
                ) : (
                  <span>Simpan Bahan Baku Baru</span>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>EDIT INFORMASI BAHAN BAKU</DialogTitle>
            <DialogDescription>
              Ubah rincian informasi bahan baku di bawah. Informasi stok hanya dapat diubah melalui panel transaksi log detail.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 font-sans">
            <ImageUploadInput
              label="Foto Bahan Baku"
              existingUrl={editMaterialData.imageUrl}
              file={editMaterialFile}
              onFileChange={setEditMaterialFile}
              onClearExisting={() => setEditMaterialData({ ...editMaterialData, imageUrl: '' })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="edit-sku" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Kode SKU*
                </label>
                <input 
                  id="edit-sku"
                  type="text" 
                  required 
                  disabled={isSavingEdit}
                  placeholder="e.g. LTH-SYN-BK01"
                  value={editMaterialData.sku}
                  onChange={(e) => setEditMaterialData({...editMaterialData, sku: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="edit-name" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Nama Bahan Baku*
                </label>
                <input 
                  id="edit-name"
                  type="text" 
                  required 
                  disabled={isSavingEdit}
                  placeholder="e.g. Synthetic Nappa Suede"
                  value={editMaterialData.name}
                  onChange={(e) => setEditMaterialData({...editMaterialData, name: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="edit-type-select" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Jenis Bahan*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTypeInline(!isAddingTypeInline)
                      setInlineTypeValue('')
                    }}
                    className="text-[10px] text-gallery-dark font-bold hover:underline cursor-pointer focus-ring"
                  >
                    {isAddingTypeInline ? 'Batal' : '+ Tambah'}
                  </button>
                </div>
                {isAddingTypeInline ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      id="edit-type-inline"
                      type="text"
                      required
                      placeholder="Jenis"
                      value={inlineTypeValue}
                      onChange={(e) => setInlineTypeValue(e.target.value)}
                      className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus-ring font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTypeInline}
                      className="w-full bg-gallery-dark text-gallery-base py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer text-center focus-ring"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select 
                    id="edit-type-select"
                    disabled={isSavingEdit}
                    value={editMaterialData.type}
                    onChange={(e) => {
                      const t = e.target.value
                      let u = 'feet'
                      if (t === 'FABRIC') u = 'meter'
                      if (t === 'GLUE') u = 'ml'
                      if (t === 'ZIPPER') u = 'pcs'
                      if (t === 'ACCESSORY') u = 'pcs'
                      
                      const matchUnit = options.units.find(un => un.name === u)
                      const unitVal = matchUnit ? matchUnit.name : (options.units[0]?.name || u)

                      setEditMaterialData({...editMaterialData, type: t, unit: unitVal})
                    }}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide uppercase disabled:opacity-50"
                  >
                    {options.types.map(t => (
                      <option key={t.id} value={t.name}>{t.label || t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="edit-category-select" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Kategori*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategoryInline(!isAddingCategoryInline)
                      setInlineCategoryValue('')
                    }}
                    className="text-[10px] text-gallery-dark font-bold hover:underline cursor-pointer focus-ring"
                  >
                    {isAddingCategoryInline ? 'Batal' : '+ Tambah'}
                  </button>
                </div>
                {isAddingCategoryInline ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      id="edit-category-inline"
                      type="text"
                      required
                      placeholder="Kategori"
                      value={inlineCategoryValue}
                      onChange={(e) => setInlineCategoryValue(e.target.value)}
                      className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus-ring font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCategoryInline}
                      className="w-full bg-gallery-dark text-gallery-base py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer text-center focus-ring"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select 
                    id="edit-category-select"
                    required 
                    disabled={isSavingEdit}
                    value={editMaterialData.category}
                    onChange={(e) => setEditMaterialData({...editMaterialData, category: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide disabled:opacity-50"
                  >
                    {options.categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="edit-quality-select" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Kualitas*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingQualityInline(!isAddingQualityInline)
                      setInlineQualityValue('')
                    }}
                    className="text-[10px] text-gallery-dark font-bold hover:underline cursor-pointer focus-ring"
                  >
                    {isAddingQualityInline ? 'Batal' : '+ Tambah'}
                  </button>
                </div>
                {isAddingQualityInline ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      id="edit-quality-inline"
                      type="text"
                      required
                      placeholder="Kualitas"
                      value={inlineQualityValue}
                      onChange={(e) => setInlineQualityValue(e.target.value)}
                      className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus-ring font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveQualityInline}
                      className="w-full bg-gallery-dark text-gallery-base py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer text-center focus-ring"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select 
                    id="edit-quality-select"
                    required 
                    disabled={isSavingEdit}
                    value={editMaterialData.quality}
                    onChange={(e) => setEditMaterialData({...editMaterialData, quality: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide disabled:opacity-50"
                  >
                    {options.qualities.map(q => (
                      <option key={q.id} value={q.name}>{q.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="edit-color" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Warna / Motif*
                </label>
                <input 
                  id="edit-color"
                  type="text" 
                  required 
                  disabled={isSavingEdit}
                  placeholder="e.g. Python Gold, Matte Slate Black"
                  value={editMaterialData.colorPattern}
                  onChange={(e) => setEditMaterialData({...editMaterialData, colorPattern: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="edit-size" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Ukuran / Detail Fisik*
                </label>
                <input 
                  id="edit-size"
                  type="text" 
                  required 
                  disabled={isSavingEdit}
                  placeholder="e.g. Gulungan, Botol, Lembar, Pcs"
                  value={editMaterialData.size}
                  onChange={(e) => setEditMaterialData({...editMaterialData, size: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label htmlFor="edit-expiry" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Tgl Kedaluwarsa
                </label>
                <input 
                  id="edit-expiry"
                  type="date" 
                  disabled={isSavingEdit}
                  value={editMaterialData.expiredAt || ''}
                  onChange={(e) => setEditMaterialData({...editMaterialData, expiredAt: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="edit-unit-select" className="text-[10px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Satuan*
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingUnitInline(!isAddingUnitInline)
                      setInlineUnitValue('')
                    }}
                    className="text-[10px] text-gallery-dark font-bold hover:underline cursor-pointer focus-ring"
                  >
                    {isAddingUnitInline ? 'Batal' : '+ Tambah'}
                  </button>
                </div>
                {isAddingUnitInline ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      id="edit-unit-inline"
                      type="text"
                      required
                      placeholder="Pcs"
                      value={inlineUnitValue}
                      onChange={(e) => setInlineUnitValue(e.target.value)}
                      className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus-ring font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveUnitInline}
                      className="w-full bg-gallery-dark text-gallery-base py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer text-center focus-ring"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select 
                    id="edit-unit-select"
                    required 
                    disabled={isSavingEdit}
                    value={editMaterialData.unit}
                    onChange={(e) => setEditMaterialData({...editMaterialData, unit: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide disabled:opacity-50"
                  >
                    {options.units.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border-[0.5px] border-gallery-line bg-gallery-split hover:bg-gallery-base text-gallery-muted hover:text-gallery-dark text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer focus-ring"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSavingEdit}
                className="bg-gallery-dark text-gallery-base py-2 px-5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus-ring"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={isDeletingOpen} onOpenChange={setIsDeletingOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>KONFIRMASI HAPUS BAHAN BAKU</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh data log transaksi terkait.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs text-gallery-dark font-medium leading-relaxed font-sans">
            Apakah Anda yakin ingin menghapus bahan baku <strong className="font-bold font-serif text-[13px] uppercase text-red-750">"{selectedMaterial?.name}"</strong> ({selectedMaterial?.sku}) secara permanen?
          </div>

          <DialogFooter className="flex sm:justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeletingOpen(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-[0.5px] border-gallery-line bg-gallery-split hover:bg-gallery-base text-gallery-muted hover:text-gallery-dark transition-all cursor-pointer font-sans focus-ring"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteMaterial}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-destructive text-destructive-foreground hover:opacity-90 transition-all cursor-pointer font-sans flex items-center justify-center gap-1.5 focus-ring"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus Permanen</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
