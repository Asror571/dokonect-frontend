import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProductFn, updateProductFn, getProductCategoriesFn } from '../../api/product.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImagePlus, ArrowLeft, CheckCircle2, X, Package } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../api/api';
import { updateDistributorProductStockFn } from '../../api/distributor.api';

const productSchema = z.object({
  name:           z.string().min(3, 'Mahsulot nomi kiritilishi shart'),
  sku:            z.string().optional(),
  categoryId:     z.string().optional(),
  brandId:        z.string().optional(),
  wholesalePrice: z.string().min(1, 'Ulgurji narx kiritilishi shart'),
  retailPrice:    z.string().optional(),
  costPrice:      z.string().optional(),
  discountType:   z.enum(['', 'PERCENT', 'FIXED']).optional(),
  discountValue:  z.string().optional(),
  description:    z.string().optional(),
  youtubeUrl:     z.string().optional(),
  unit:           z.string().min(1, 'Birlik kiritilishi shart'),
  status:         z.enum(['ACTIVE', 'DRAFT', 'OUT_OF_STOCK']),
  initialStock:   z.string().optional(),
});
type ProductForm = z.infer<typeof productSchema>;

const UNITS = [
  { value: 'dona',     label: 'Dona'             },
  { value: 'kg',       label: 'Kilogram (kg)'    },
  { value: 'g',        label: 'Gram (g)'         },
  { value: 'litr',     label: 'Litr'             },
  { value: 'ml',       label: 'Millilitr (ml)'   },
  { value: 'metr',     label: 'Metr'             },
  { value: 'sm',       label: 'Santimetr (sm)'   },
  { value: 'quti',     label: 'Quti'             },
  { value: 'paket',    label: 'Paket'            },
  { value: 'juft',     label: 'Juft'             },
  { value: 'komplekt', label: 'Komplekt'         },
  { value: 'tonna',    label: 'Tonna'            },
];

const AddProductPage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const queryClient = useQueryClient();
  const { user }    = useAuthStore();

  const editProduct = location.state as any;
  const isEditing   = !!editProduct;

  const [images,         setImages]         = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>(editProduct?.images || []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { status: 'ACTIVE', unit: 'dona', initialStock: '0' },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['product-categories', user?.distributorId],
    queryFn: () => getProductCategoriesFn(user?.distributorId || ''),
    enabled: !!user?.distributorId,
    retry: false,
  });
  const categories: any[] = categoriesData?.data || categoriesData || [];

  useEffect(() => {
    if (isEditing && editProduct) {
      reset({
        name:           editProduct.name           || '',
        sku:            editProduct.sku             || '',
        categoryId:     editProduct.categoryId      || '',
        brandId:        editProduct.brandId         || '',
        wholesalePrice: String(editProduct.wholesalePrice || ''),
        retailPrice:    String(editProduct.retailPrice    || ''),
        costPrice:      String(editProduct.costPrice      || ''),
        discountType:   editProduct.discountType    || '',
        discountValue:  String(editProduct.discountValue  || ''),
        description:    editProduct.description     || '',
        youtubeUrl:     editProduct.youtubeUrl      || '',
        unit:           editProduct.unit            || 'dona',
        status:         editProduct.status          || 'ACTIVE',
        initialStock:   '0',
      });
      setExistingImages(editProduct.images || []);
    }
  }, [isEditing, editProduct, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) toast.error("Ba'zi rasmlar 5MB dan katta");
    if (images.length + valid.length + existingImages.length > 10) {
      toast.error('Maksimal 10 ta rasm'); return;
    }
    setImages((prev) => [...prev, ...valid]);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) setExistingImages((p) => p.filter((_, i) => i !== index));
    else setImages((p) => p.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];
    try {
      const formData = new FormData();
      images.forEach((img) => formData.append('files', img));
      const res = await api.post('/api/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.urls || [];
    } catch { return []; }
  };

  const onDone = (msg: string) => {
    toast.success(msg);
    queryClient.invalidateQueries({ queryKey: ['distributor-products'] });
    navigate('/distributor/products');
  };

  const { mutate: createProduct, isPending: isCreating } = useMutation({
    mutationFn: async (formData: ProductForm) => {
      const newImageUrls = await uploadImages();
      const allImages = [
        ...existingImages.map((img: any) => img.url || img),
        ...newImageUrls,
      ];

      const res = await createProductFn({
        distributorId: user?.distributorId || user?.id || '',
        data: {
          name:           formData.name,
          sku:            formData.sku            || '',
          description:    formData.description,
          wholesalePrice: Number(formData.wholesalePrice),
          retailPrice:    formData.retailPrice ? Number(formData.retailPrice) : 0,
          costPrice:      formData.costPrice ? Number(formData.costPrice) : undefined,
          unit:           formData.unit,
          categoryId:     formData.categoryId    || undefined,
          brandId:        formData.brandId       || undefined,
          status:         formData.status        as any,
          discountType:   (formData.discountType || undefined) as any,
          discountValue:  formData.discountValue ? Number(formData.discountValue) : undefined,
          youtubeUrl:     formData.youtubeUrl,
          images:         allImages,
        },
      });

      const stockQty  = Number(formData.initialStock || 0);
      const productId = res?.data?.id || res?.id;
      if (stockQty > 0 && productId) {
        try {
          await updateDistributorProductStockFn({
            productId,
            data: { quantity: stockQty, type: 'SET', note: 'Dastlabki zaxira' },
          });
        } catch { /* backend muammosi — jimgina o'tkazib yuborish */ }
      }
      return res;
    },
    onSuccess: () => onDone("Mahsulot qo'shildi"),
    onError:   (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const { mutate: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async (formData: ProductForm) => {
      const newImageUrls = await uploadImages();
      const allImages = [
        ...existingImages.map((img: any) => img.url || img),
        ...newImageUrls,
      ];

      const res = await updateProductFn({
        id: editProduct.id,
        data: {
          name:           formData.name,
          sku:            formData.sku,
          description:    formData.description,
          wholesalePrice: Number(formData.wholesalePrice),
          retailPrice:    formData.retailPrice ? Number(formData.retailPrice) : undefined,
          costPrice:      formData.costPrice ? Number(formData.costPrice) : undefined,
          unit:           formData.unit,
          categoryId:     formData.categoryId    || undefined,
          brandId:        formData.brandId       || undefined,
          status:         formData.status        as any,
          discountType:   (formData.discountType || undefined) as any,
          discountValue:  formData.discountValue ? Number(formData.discountValue) : undefined,
          youtubeUrl:     formData.youtubeUrl,
          images:         allImages,
        },
      });

      const stockQty = Number(formData.initialStock || 0);
      if (stockQty > 0) {
        try {
          await updateDistributorProductStockFn({
            productId: editProduct.id,
            data: { quantity: stockQty, type: 'ADD', note: "Qo'lda yangilash" },
          });
        } catch { /* ignore */ }
      }
      return res;
    },
    onSuccess: () => onDone('Mahsulot yangilandi'),
    onError:   (e: any) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const onSubmit    = (data: ProductForm) => { if (isEditing) updateProduct(data); else createProduct(data); };
  const isPending   = isCreating || isUpdating;
  const totalImages = existingImages.length + images.length;

  return (
    <div className="fade-in max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/distributor/products')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Mahsulot parametrlarini to'ldiring</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* ── Asosiy ── */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2 mb-5">Asosiy ma'lumotlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Mahsulot nomi *" placeholder="Masalan: Galaxy S24"
                error={errors.name?.message} {...register('name')} />

              <Input label="SKU / Kod" placeholder="Bo'sh qoldiring — avtomatik"
                error={errors.sku?.message} {...register('sku')} />

              {/* Kategoriya */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Kategoriya</label>
                <select {...register('categoryId')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all">
                  <option value="">Tanlang</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* O'lchov birligi — SELECT */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">O'lchov birligi *</label>
                <select {...register('unit')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all">
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
                {errors.unit && <p className="text-xs text-red-500">{errors.unit.message}</p>}
              </div>
            </div>
          </section>

          {/* ── Narx ── */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2 mb-5">Narx</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Ulgurji narx (UZS) *" type="number" placeholder="15000"
                error={errors.wholesalePrice?.message} {...register('wholesalePrice')} />
              <Input label="Chakana narx (UZS)" type="number" placeholder="20000"
                error={errors.retailPrice?.message} {...register('retailPrice')} />
              <Input label="Tannarx (UZS)" type="number" placeholder="12000"
                error={errors.costPrice?.message} {...register('costPrice')} />

              {/* Chegirma turi */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Chegirma turi</label>
                <select {...register('discountType')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all">
                  <option value="">Yo'q</option>
                  <option value="PERCENT">Foiz (%)</option>
                  <option value="FIXED">Summa (UZS)</option>
                </select>
              </div>

              <Input label="Chegirma qiymati" type="number" placeholder="10"
                error={errors.discountValue?.message} {...register('discountValue')} />
            </div>
          </section>

          {/* ── Zaxira ── */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2 mb-5 flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-500" /> Zaxira (Ombor)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  {isEditing ? "Qo'shimcha miqdor (dona)" : 'Dastlabki miqdor (dona)'}
                </label>
                <input type="number" min="0" placeholder="0" {...register('initialStock')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all" />
                <p className="text-xs text-slate-400">
                  {isEditing
                    ? "Mavjud zaxiraga qo'shiladi. 0 qoldirsangiz o'zgarmaydi."
                    : "Mahsulot yaratilgandan so'ng omborga qo'shiladi."}
                </p>
              </div>
            </div>
          </section>

          {/* ── Qo'shimcha ── */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2 mb-5">Qo'shimcha</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Holati</label>
                <select {...register('status')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all">
                  <option value="ACTIVE">Faol</option>
                  <option value="DRAFT">Qoralama</option>
                  <option value="OUT_OF_STOCK">Tugagan</option>
                </select>
              </div>

              <Input label="YouTube havolasi" placeholder="https://youtube.com/..."
                error={errors.youtubeUrl?.message} {...register('youtubeUrl')} />

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Tavsif</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all h-28 resize-y"
                  placeholder="Mahsulot haqida batafsil ma'lumot..."
                  {...register('description')} />
              </div>
            </div>
          </section>

          {/* ── Rasmlar ── */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2 mb-5">
              Rasmlar ({totalImages}/10)
            </h3>
            <div className="flex flex-wrap gap-4">
              {existingImages.map((img: any, i: number) => (
                <div key={`exist-${i}`} className="relative w-28 h-28 border border-slate-200 rounded-xl overflow-hidden group">
                  <img src={img.url || img} alt="product" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i, true)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-sky-500 text-white text-[10px] text-center py-0.5">
                      Asosiy
                    </div>
                  )}
                </div>
              ))}

              {images.map((img, i) => (
                <div key={`new-${i}`} className="relative w-28 h-28 border border-slate-200 rounded-xl overflow-hidden group">
                  <img src={URL.createObjectURL(img)} alt="product" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i, false)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                  {existingImages.length === 0 && i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-sky-500 text-white text-[10px] text-center py-0.5">
                      Asosiy
                    </div>
                  )}
                </div>
              ))}

              {totalImages < 10 && (
                <>
                  <input type="file" id="images-up" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                  <label htmlFor="images-up"
                    className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all text-slate-400 hover:text-sky-500">
                    <ImagePlus className="w-6 h-6 mb-1" />
                    <span className="text-[10px] uppercase font-semibold">Qo'shish</span>
                  </label>
                </>
              )}
            </div>
          </section>

          {/* ── Tugmalar ── */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary"
              onClick={() => navigate('/distributor/products')} className="px-8">
              Bekor qilish
            </Button>
            <Button type="submit" isLoading={isPending} className="px-8 bg-sky-500 hover:bg-sky-600">
              {!isPending && (
                <><CheckCircle2 className="w-4 h-4 mr-2" />{isEditing ? 'Saqlash' : "Qo'shish"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;