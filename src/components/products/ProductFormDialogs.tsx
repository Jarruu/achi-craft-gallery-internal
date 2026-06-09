import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import { ImageUploadInput } from '../ImageUploadInput'
import { Loader2, PlusCircle, Trash2 } from 'lucide-react'

interface ProductFormDialogsProps {
  materials: any[]
  
  // Create dialog state
  isAdding: boolean
  setIsAdding: (open: boolean) => void
  newProduct: any
  setNewProduct: (p: any) => void
  newProductFile: File | null
  setNewProductFile: (file: File | null) => void
  selectedBOMItems: Array<{ materialId: string, quantityRequired: number, notes: string }>
  setSelectedBOMItems: (items: any[]) => void
  isSavingNew: boolean
  handleSubmitProduct: (e: React.FormEvent) => void

  // Edit dialog state
  isEditing: boolean
  setIsEditing: (open: boolean) => void
  editProductData: any
  setEditProductData: (p: any) => void
  editProductFile: File | null
  setEditProductFile: (file: File | null) => void
  editBOMItems: Array<{ materialId: string, quantityRequired: number, notes: string }>
  setEditBOMItems: (items: any[]) => void
  isSavingEdit: boolean
  handleEditProductSubmit: (e: React.FormEvent) => void

  // Delete dialog state
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  selectedProduct: any
  isDeleting: boolean
  handleDeleteProduct: () => void
}

export function ProductFormDialogs({
  materials,
  isAdding,
  setIsAdding,
  newProduct,
  setNewProduct,
  newProductFile,
  setNewProductFile,
  selectedBOMItems,
  setSelectedBOMItems,
  isSavingNew,
  handleSubmitProduct,
  isEditing,
  setIsEditing,
  editProductData,
  setEditProductData,
  editProductFile,
  setEditProductFile,
  editBOMItems,
  setEditBOMItems,
  isSavingEdit,
  handleEditProductSubmit,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  selectedProduct,
  isDeleting,
  handleDeleteProduct
}: ProductFormDialogsProps) {

  // Create Form helpers
  const handleAddBOMRow = () => {
    setSelectedBOMItems([...selectedBOMItems, { materialId: '', quantityRequired: 1, notes: '' }])
  }

  const handleRemoveBOMRow = (index: number) => {
    if (selectedBOMItems.length === 1) return
    const next = [...selectedBOMItems]
    next.splice(index, 1)
    setSelectedBOMItems(next)
  }

  const handleBOMChange = (index: number, key: string, value: any) => {
    const next = [...selectedBOMItems]
    next[index] = {
      ...next[index],
      [key]: value
    }
    setSelectedBOMItems(next)
  }

  // Edit Form helpers
  const handleAddEditBOMRow = () => {
    setEditBOMItems([...editBOMItems, { materialId: '', quantityRequired: 1, notes: '' }])
  }

  const handleRemoveEditBOMRow = (index: number) => {
    if (editBOMItems.length === 1) return
    const next = [...editBOMItems]
    next.splice(index, 1)
    setEditBOMItems(next)
  }

  const handleEditBOMChange = (index: number, key: string, value: any) => {
    const next = [...editBOMItems]
    next[index] = {
      ...next[index],
      [key]: value
    }
    setEditBOMItems(next)
  }

  return (
    <>
      {/* CREATE DIALOG */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>FORM PRODUK BARU</DialogTitle>
            <DialogDescription>
              Buat rancangan produk baru dan tentukan Bill of Materials (BOM) bahan bakunya.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitProduct} className="space-y-4 flex flex-col overflow-hidden font-sans">
            <div className="overflow-y-auto pr-2 space-y-4 max-h-[55vh] md:max-h-[60vh] custom-scrollbar flex-1">
              <ImageUploadInput
                label="Foto / Gambar Produk"
                existingUrl={newProduct.imageUrl}
                file={newProductFile}
                onFileChange={setNewProductFile}
                onClearExisting={() => setNewProduct({ ...newProduct, imageUrl: '' })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="create-product-name" className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold block">
                    Nama Produk*
                  </label>
                  <input 
                    id="create-product-name"
                    type="text" 
                    required 
                    disabled={isSavingNew}
                    placeholder="cth. Dompet Kulit Minimalis"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="create-product-desc" className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold block">
                    Deskripsi & Penjelasan Produk
                  </label>
                  <textarea 
                    id="create-product-desc"
                    rows={3}
                    disabled={isSavingNew}
                    placeholder="e.g. Dompet minimalis gaya Nordic..."
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring resize-y min-h-[60px] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Dynamic BOM ingredient selectors */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b-[0.5px] border-gallery-line pb-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-gallery-dark font-bold">
                    DAFTAR KEBUTUHAN BAHAN BAKU (BOM)
                  </span>
                  <button 
                    type="button"
                    disabled={isSavingNew}
                    onClick={handleAddBOMRow}
                    className="text-[10px] font-bold text-gallery-dark uppercase tracking-widest flex items-center gap-1 hover:opacity-80 cursor-pointer disabled:opacity-50 focus-ring"
                  >
                    <PlusCircle size={12} /> Tambah Bahan Baku
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedBOMItems.map((item, index) => (
                    <div key={index} className="bg-gallery-base p-3 border-[0.5px] border-gallery-line space-y-2 relative">
                      {selectedBOMItems.length > 1 && (
                        <button 
                          type="button"
                          disabled={isSavingNew}
                          onClick={() => handleRemoveBOMRow(index)}
                          className="absolute top-2 right-2 text-gallery-muted hover:text-red-650 transition-colors cursor-pointer disabled:opacity-50 focus-ring"
                          aria-label={`Hapus bahan baku ke-${index + 1}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label htmlFor={`create-bom-mat-${index}`} className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold block">
                            Pilih Bahan Baku
                          </label>
                          <select 
                            id={`create-bom-mat-${index}`}
                            required
                            disabled={isSavingNew}
                            value={item.materialId}
                            onChange={(e) => handleBOMChange(index, 'materialId', e.target.value)}
                            className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus-ring font-semibold uppercase tracking-wider disabled:opacity-50"
                          >
                            <option value="">-- Pilih --</option>
                            {materials.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.sku} - {m.name} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label htmlFor={`create-bom-qty-${index}`} className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold block">
                            Jumlah yang Dibutuhkan
                          </label>
                          <input 
                            id={`create-bom-qty-${index}`}
                            type="number" 
                            step="any"
                            min="0.001"
                            required
                            disabled={isSavingNew}
                            placeholder="e.g. 2.5"
                            value={item.quantityRequired || ''}
                            onChange={(e) => handleBOMChange(index, 'quantityRequired', Number(e.target.value))}
                            className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus-ring font-bold disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor={`create-bom-note-${index}`} className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold block">
                          Keterangan Bagian Produk (cth: untuk bagian luar)
                        </label>
                        <input 
                          id={`create-bom-note-${index}`}
                          type="text" 
                          disabled={isSavingNew}
                          placeholder="cth. Untuk bagian luar, lapisan dalam..."
                          value={item.notes || ''}
                          onChange={(e) => handleBOMChange(index, 'notes', e.target.value)}
                          className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus-ring disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row gap-2 shrink-0">
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
                    <span>Menyimpan Produk...</span>
                  </>
                ) : (
                  <span>Simpan Rancangan Produk</span>
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
            <DialogTitle>EDIT RANCANGAN PRODUK</DialogTitle>
            <DialogDescription>
              Ubah informasi cetak biru dan kebutuhan bahan baku (BOM) produk ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditProductSubmit} className="space-y-4 flex flex-col overflow-hidden font-sans">
            <div className="overflow-y-auto pr-2 space-y-4 max-h-[55vh] md:max-h-[60vh] custom-scrollbar flex-1">
              <ImageUploadInput
                label="Foto / Gambar Produk"
                existingUrl={editProductData.imageUrl}
                file={editProductFile}
                onFileChange={setEditProductFile}
                onClearExisting={() => setEditProductData({ ...editProductData, imageUrl: '' })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="edit-product-name" className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold block">
                    Nama Produk*
                  </label>
                  <input 
                    id="edit-product-name"
                    type="text" 
                    required 
                    disabled={isSavingEdit}
                    placeholder="cth. Dompet Kulit Minimalis"
                    value={editProductData.name}
                    onChange={(e) => setEditProductData({...editProductData, name: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-product-desc" className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold block">
                    Deskripsi & Penjelasan Produk
                  </label>
                  <textarea 
                    id="edit-product-desc"
                    rows={3}
                    disabled={isSavingEdit}
                    placeholder="e.g. Dompet minimalis gaya Nordic..."
                    value={editProductData.description || ''}
                    onChange={(e) => setEditProductData({...editProductData, description: e.target.value})}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring resize-y min-h-[60px] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Dynamic BOM ingredient selectors */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b-[0.5px] border-gallery-line pb-1.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-gallery-dark font-bold">
                    DAFTAR KEBUTUHAN BAHAN BAKU (BOM)
                  </span>
                  <button 
                    type="button"
                    disabled={isSavingEdit}
                    onClick={handleAddEditBOMRow}
                    className="text-[10px] font-bold text-gallery-dark uppercase tracking-widest flex items-center gap-1 hover:opacity-80 cursor-pointer disabled:opacity-50 focus-ring"
                  >
                    <PlusCircle size={12} /> Tambah Bahan Baku
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {editBOMItems.map((item, index) => (
                    <div key={index} className="bg-gallery-base p-3 border-[0.5px] border-gallery-line space-y-2 relative">
                      {editBOMItems.length > 1 && (
                        <button 
                          type="button"
                          disabled={isSavingEdit}
                          onClick={() => handleRemoveEditBOMRow(index)}
                          className="absolute top-2 right-2 text-gallery-muted hover:text-red-650 transition-colors cursor-pointer disabled:opacity-50 focus-ring"
                          aria-label={`Hapus bahan baku edit ke-${index + 1}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label htmlFor={`edit-bom-mat-${index}`} className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold block">
                            Pilih Bahan Baku
                          </label>
                          <select 
                            id={`edit-bom-mat-${index}`}
                            required
                            disabled={isSavingEdit}
                            value={item.materialId}
                            onChange={(e) => handleEditBOMChange(index, 'materialId', e.target.value)}
                            className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus-ring font-semibold uppercase tracking-wider disabled:opacity-50"
                          >
                            <option value="">-- Pilih --</option>
                            {materials.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.sku} - {m.name} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label htmlFor={`edit-bom-qty-${index}`} className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold block">
                            Jumlah yang Dibutuhkan
                          </label>
                          <input 
                            id={`edit-bom-qty-${index}`}
                            type="number" 
                            step="any"
                            min="0.001"
                            required
                            disabled={isSavingEdit}
                            placeholder="e.g. 2.5"
                            value={item.quantityRequired || ''}
                            onChange={(e) => handleEditBOMChange(index, 'quantityRequired', Number(e.target.value))}
                            className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus-ring font-bold disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor={`edit-bom-note-${index}`} className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold block">
                          Keterangan Bagian Produk (cth: untuk bagian luar)
                        </label>
                        <input 
                          id={`edit-bom-note-${index}`}
                          type="text" 
                          disabled={isSavingEdit}
                          placeholder="cth. Untuk bagian luar, lapisan dalam..."
                          value={item.notes || ''}
                          onChange={(e) => handleEditBOMChange(index, 'notes', e.target.value)}
                          className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus-ring disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row gap-2 shrink-0">
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

      {/* DESTRUCTIVE DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 font-serif">HAPUS RANCANGAN PRODUK</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 font-sans text-xs">
            <p className="text-gallery-dark leading-relaxed font-semibold">
              Apakah Anda yakin ingin menghapus rancangan produk <strong className="font-bold text-gallery-dark">{selectedProduct?.name}</strong> secara permanen? Tindakan ini tidak dapat dibatalkan dan semua data cetak biru kebutuhan bahan baku (BOM) terkait akan ikut terhapus.
            </p>

            <DialogFooter className="flex sm:justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 border-[0.5px] border-gallery-line text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:border-gallery-dark hover:text-gallery-dark duration-200 cursor-pointer focus-ring disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold uppercase tracking-wider hover:opacity-90 duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus-ring disabled:opacity-50"
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
