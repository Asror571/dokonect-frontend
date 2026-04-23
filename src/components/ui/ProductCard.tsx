import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: any;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/distributor/products/add', { state: product });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
      onDelete(product.id);
    }
  };

  // Ombor hisobi — inventory array yoki to'g'ridan-to'g'ri stock field
  const totalStock =
    product.inventory?.reduce(
      (sum: number, inv: any) => sum + ((inv.quantity ?? 0) - (inv.reserved ?? 0)),
      0
    ) ??
    product.stock ??
    0;

  const minThreshold = product.inventory?.[0]?.minThreshold ?? 5;
  const isLowStock   = totalStock > 0 && totalStock <= minThreshold;
  const isOutOfStock = totalStock === 0;

  // Muqova rasm
  const photoUrl =
    product.images?.find((img: any) => img.isCover)?.url ||
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.imageUrl ||
    null;

  // Narx
  const price = product.wholesalePrice ?? product.price ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-100 flex-shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-slate-300" />
          </div>
        )}

        {/* Low stock badge */}
        {isLowStock && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 shadow-sm">
            <AlertTriangle className="w-3 h-3" />
            Kam qoldi
          </div>
        )}

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 shadow-sm">
            <AlertTriangle className="w-3 h-3" />
            Tugagan
          </div>
        )}

        {/* Edit / Delete buttons (hover) */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1.5 bg-white/90 backdrop-blur rounded-md shadow-sm text-slate-600 hover:text-sky-500 hover:bg-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 bg-white/90 backdrop-blur rounded-md shadow-sm text-slate-600 hover:text-red-500 hover:bg-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status badge */}
        <div className="absolute bottom-2 left-2">
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
              product.status === 'ACTIVE'
                ? 'bg-green-500/90 text-white'
                : product.status === 'DRAFT'
                ? 'bg-slate-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {product.status === 'ACTIVE'
              ? 'Faol'
              : product.status === 'DRAFT'
              ? 'Qoralama'
              : 'Nofaol'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-1.5">
          {product.category?.name || product.category || 'Kategoriyasiz'}
        </p>

        <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        <p className="text-[11px] font-mono text-slate-400 mb-3 uppercase">
          {product.sku || '—'}
        </p>

        {/* Price + Stock */}
        <div className="flex items-end justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            {product.retailPrice && product.retailPrice > price && (
              <p className="text-[10px] text-slate-400 line-through mb-0.5">
                {product.retailPrice.toLocaleString('uz-UZ')} UZS
              </p>
            )}
            <p className="text-lg font-black text-slate-900 leading-none">
              {price.toLocaleString('uz-UZ')}{' '}
              <span className="text-[10px] font-bold text-slate-500 uppercase">UZS</span>
            </p>
          </div>

          <div className="text-right">
            <div
              className={`text-sm font-bold ${
                isOutOfStock
                  ? 'text-red-500'
                  : isLowStock
                  ? 'text-amber-500'
                  : 'text-green-500'
              }`}
            >
              {totalStock}{' '}
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                {product.unit || 'dona'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};