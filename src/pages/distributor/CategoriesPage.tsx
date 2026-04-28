import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag, Edit2, Trash2, X, Loader2, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  getCategoriesFn,
  createCategoryFn,
  updateCategoryFn,
  deleteCategoryFn,
} from '../../api/categories.api';
import { useAuthStore } from '../../store/authStore';

interface CategoryForm {
  name: string;
  slug: string;
  parentId: string;
  icon: string;
}

const emptyForm: CategoryForm = { name: '', slug: '', parentId: '', icon: '' };

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { user }    = useAuthStore();

  const distributorId = user?.distributorId || '';

  const [showModal,   setShowModal]   = useState(false);
  const [editingCat,  setEditingCat]  = useState<any>(null);
  const [form,        setForm]        = useState<CategoryForm>(emptyForm);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const { data: catsRes, isLoading } = useQuery({
    queryKey: ['categories', distributorId],
    queryFn: () => getCategoriesFn(distributorId),
    enabled: !!distributorId,
    retry: false,
  });

  const categories: any[] = catsRes?.data?.categories || catsRes?.data || catsRes || [];

  // ── Create ────────────────────────────────────────────────────────────────
  const { mutate: createCat, isPending: creating } = useMutation({
    mutationFn: () =>
      createCategoryFn({
        name:          form.name,
        slug:          form.slug || slugify(form.name),
        distributorId,
        parentId:      form.parentId || undefined,
        icon:          form.icon    || undefined,
      }),
    onSuccess: () => {
      toast.success("Kategoriya qo'shildi");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  // ── Update ────────────────────────────────────────────────────────────────
  const { mutate: updateCat, isPending: updating } = useMutation({
    mutationFn: () =>
      updateCategoryFn({
        id:   editingCat.id,
        data: {
          name:     form.name,
          slug:     form.slug || slugify(form.name),
          parentId: form.parentId || undefined,
          icon:     form.icon    || undefined,
        },
      }),
    onSuccess: () => {
      toast.success('Kategoriya yangilandi');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  const { mutate: deleteCat, isPending: deleting } = useMutation({
    mutationFn: (id: string) => deleteCategoryFn(id),
    onSuccess: () => {
      toast.success("Kategoriya o'chirildi");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "O'chirishda xatolik"),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingCat(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (cat: any) => {
    setEditingCat(cat);
    setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || '', icon: cat.icon || '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingCat(null); setForm(emptyForm); };

  const handleSave = () => { if (editingCat) updateCat(); else createCat(); };

  const isPending = creating || updating;

  // ── Root va child kategoriyalar ───────────────────────────────────────────
  const rootCats  = categories.filter((c: any) => !c.parentId);
  const childCats = (parentId: string) => categories.filter((c: any) => c.parentId === parentId);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
    </div>
  );

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kategoriyalar</h1>
          <p className="text-slate-500 text-sm mt-0.5">{categories.length} ta kategoriya</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Kategoriya qo'shish
        </button>
      </div>

      {/* No distributor warning */}
      {!distributorId && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm">
          Distributor ID topilmadi. Iltimos, qayta login qiling.
        </div>
      )}

      {/* Empty */}
      {categories.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-2xl border border-dashed border-slate-300 gap-3">
          <FolderOpen className="w-12 h-12 text-slate-300" />
          <p className="text-slate-500 font-medium">Kategoriyalar yo'q</p>
          <p className="text-slate-400 text-sm">Birinchi kategoriyangizni qo'shing</p>
          <button onClick={openCreate} className="mt-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors">
            Qo'shish
          </button>
        </div>
      )}

      {/* Categories list */}
      {rootCats.length > 0 && (
        <div className="space-y-4">
          {rootCats.map((cat: any) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Root category */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-lg">
                    {cat.icon || <Tag className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{cat.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    {childCats(cat.id).length} ta subkategoriya
                  </span>
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Child categories */}
              {childCats(cat.id).length > 0 && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {childCats(cat.id).map((child: any) => (
                    <div key={child.id} className="flex items-center justify-between px-5 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 ml-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{child.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{child.slug}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(child)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(child.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCat ? 'Kategoriyani tahrirlash' : "Yangi kategoriya"}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomi *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    name: e.target.value,
                    slug: p.slug || slugify(e.target.value),
                  }))}
                  placeholder="Masalan: Elektronika"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="elektronika"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">Bo'sh qoldirsangiz avtomatik yaratiladi</p>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Emoji / Icon (ixtiyoriy)</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="📱"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                />
              </div>

              {/* Parent */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ota-kategoriya (ixtiyoriy)</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 bg-white"
                >
                  <option value="">Yo'q (asosiy kategoriya)</option>
                  {rootCats
                    .filter((c: any) => c.id !== editingCat?.id)
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Bekor
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !form.name}
                className="flex-1 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 disabled:opacity-60 transition-colors"
              >
                {isPending
                  ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  : editingCat ? 'Saqlash' : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-slate-500 text-sm mb-6">
              Bu kategoriyani o'chirsangiz, unga bog'liq mahsulotlar kategoriyasiz qoladi.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Bekor
              </button>
              <button
                onClick={() => deleteCat(deleteId)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;