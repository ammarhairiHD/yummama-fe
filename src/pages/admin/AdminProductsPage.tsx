import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X, Star, Tag } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import {
  adminGetMenu, adminCreateMenuItem, adminUpdateMenuItem, adminDeleteMenuItem,
  adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
} from '../../api/admin'
import type { MenuItem, Category } from '../../types'

type Tab = 'products' | 'categories'

function ProductForm({
  initial,
  categories,
  onSave,
  onClose,
}: {
  initial?: MenuItem | null
  categories: Category[]
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price?.toString() ?? '',
    image: initial?.image ?? '',
    category: typeof initial?.category === 'object' ? initial.category._id : (initial?.category ?? ''),
    preparationTime: initial?.preparationTime?.toString() ?? '15',
    calories: initial?.calories?.toString() ?? '',
    tags: initial?.tags?.join(', ') ?? '',
    isAvailable: initial?.isAvailable ?? true,
    isFeatured: initial?.isFeatured ?? false,
  })

  const handle = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category) return toast.error('Name, price, and category are required')
    setSaving(true)
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
        preparationTime: parseInt(form.preparationTime),
        calories: form.calories ? parseInt(form.calories) : undefined,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      })
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="font-bold text-white">{initial ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <Field label="Product Name *">
            <input value={form.name} onChange={(e) => handle('name', e.target.value)}
              className={inputCls} placeholder="Nasi Goreng Kampung" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => handle('description', e.target.value)}
              className={inputCls + ' resize-none'} rows={2} placeholder="Short description…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (RM) *">
              <input type="number" step="0.10" min="0" value={form.price} onChange={(e) => handle('price', e.target.value)}
                className={inputCls} placeholder="12.90" />
            </Field>
            <Field label="Category *">
              <select value={form.category} onChange={(e) => handle('category', e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prep Time (min)">
              <input type="number" min="1" value={form.preparationTime} onChange={(e) => handle('preparationTime', e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Calories (kcal)">
              <input type="number" min="0" value={form.calories} onChange={(e) => handle('calories', e.target.value)}
                className={inputCls} placeholder="Optional" />
            </Field>
          </div>
          <Field label="Image URL">
            <input value={form.image} onChange={(e) => handle('image', e.target.value)}
              className={inputCls} placeholder="https://…" />
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={form.tags} onChange={(e) => handle('tags', e.target.value)}
              className={inputCls} placeholder="spicy, bestseller, popular" />
          </Field>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <button type="button" onClick={() => handle('isAvailable', !form.isAvailable)}>
                {form.isAvailable
                  ? <ToggleRight className="w-8 h-8 text-green-400" />
                  : <ToggleLeft className="w-8 h-8 text-gray-600" />}
              </button>
              <span className="text-sm text-gray-300">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <button type="button" onClick={() => handle('isFeatured', !form.isFeatured)}>
                {form.isFeatured
                  ? <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  : <Star className="w-5 h-5 text-gray-600" />}
              </button>
              <span className="text-sm text-gray-300">Featured</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CategoryForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Category | null
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    icon: initial?.icon ?? '',
    order: initial?.order?.toString() ?? '1',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return toast.error('Name is required')
    setSaving(true)
    try {
      await onSave({ ...form, order: parseInt(form.order), slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') })
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-gray-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="font-bold text-white">{initial ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <Field label="Category Name *">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls} placeholder="Rice & Noodles" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Icon (emoji)">
              <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className={inputCls} placeholder="🍚" />
            </Field>
            <Field label="Display Order">
              <input type="number" min="1" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                className={inputCls} />
            </Field>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? 'Saving…' : initial ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function AdminProductsPage() {
  const [tab, setTab] = useState<Tab>('products')
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [productModal, setProductModal] = useState<{ open: boolean; item?: MenuItem | null }>({ open: false })
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; cat?: Category | null }>({ open: false })
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null)

  useEffect(() => {
    Promise.all([adminGetMenu(), adminGetCategories()])
      .then(([m, c]) => { setItems(m.items); setCategories(c.categories) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const saveProduct = async (data: any) => {
    if (productModal.item) {
      const res = await adminUpdateMenuItem(productModal.item._id, data)
      setItems((prev) => prev.map((i) => i._id === productModal.item!._id ? res.item : i))
      toast.success('Product updated')
    } else {
      const res = await adminCreateMenuItem(data)
      setItems((prev) => [res.item, ...prev])
      toast.success('Product added')
    }
  }

  const saveCategory = async (data: any) => {
    if (categoryModal.cat) {
      const res = await adminUpdateCategory(categoryModal.cat._id, data)
      setCategories((prev) => prev.map((c) => c._id === categoryModal.cat!._id ? res.category : c))
      toast.success('Category updated')
    } else {
      const res = await adminCreateCategory(data)
      setCategories((prev) => [...prev, res.category])
      toast.success('Category added')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      if (deleteConfirm.type === 'product') {
        await adminDeleteMenuItem(deleteConfirm.id)
        setItems((prev) => prev.filter((i) => i._id !== deleteConfirm.id))
        toast.success('Product deleted')
      } else {
        await adminDeleteCategory(deleteConfirm.id)
        setCategories((prev) => prev.filter((c) => c._id !== deleteConfirm.id))
        toast.success('Category deleted')
      }
    } catch { toast.error('Failed to delete') }
    setDeleteConfirm(null)
  }

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase()
    const catId = typeof item.category === 'object' ? item.category._id : item.category
    const matchCat = catFilter === 'all' || catId === catFilter
    const matchSearch = !q || item.name.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Products</h1>
        <button
          onClick={() => tab === 'products' ? setProductModal({ open: true }) : setCategoryModal({ open: true })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          {tab === 'products' ? 'Add Product' : 'Add Category'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 p-1 rounded-xl w-fit">
        {(['products', 'categories'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition capitalize',
              tab === t ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <>
          {/* Search + category filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gray-900 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const cat = typeof item.category === 'object' ? item.category : categories.find((c) => c._id === item.category)
                return (
                  <div key={item._id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-800" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-2xl shrink-0">
                        {cat?.icon ?? '🍽️'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm truncate">{item.name}</p>
                        {item.isFeatured && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
                        {!item.isAvailable && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 shrink-0">Off</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span>{cat?.icon} {cat?.name ?? '—'}</span>
                        <span>·</span>
                        <span className="font-semibold text-orange-400">RM {item.price.toFixed(2)}</span>
                        {item.tags?.length > 0 && (
                          <>
                            <span>·</span>
                            <div className="flex gap-1">
                              {item.tags.slice(0, 2).map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-500">{t}</span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setProductModal({ open: true, item })}
                        className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'product', id: item._id, name: item.name })}
                        className="p-2 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'categories' && (
        <div className="space-y-2">
          {categories.sort((a, b) => a.order - b.order).map((cat) => {
            const productCount = items.filter((i) => {
              const cId = typeof i.category === 'object' ? i.category._id : i.category
              return cId === cat._id
            }).length
            return (
              <div key={cat._id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="w-11 h-11 rounded-xl bg-gray-800 flex items-center justify-center text-2xl shrink-0">
                  {cat.icon ?? '📦'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{cat.name}</p>
                  <p className="text-xs text-gray-400">{productCount} product{productCount !== 1 ? 's' : ''} · Order #{cat.order}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCategoryModal({ open: true, cat })}
                    className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ type: 'category', id: cat._id, name: cat.name })}
                    className="p-2 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {productModal.open && (
        <ProductForm
          initial={productModal.item}
          categories={categories}
          onSave={saveProduct}
          onClose={() => setProductModal({ open: false })}
        />
      )}
      {categoryModal.open && (
        <CategoryForm
          initial={categoryModal.cat}
          onSave={saveCategory}
          onClose={() => setCategoryModal({ open: false })}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <h3 className="font-semibold text-white mb-2">Delete {deleteConfirm.type === 'product' ? 'Product' : 'Category'}?</h3>
            <p className="text-sm text-gray-400 mb-4">
              <span className="text-white font-medium">"{deleteConfirm.name}"</span> will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
