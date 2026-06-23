import { Link } from 'react-router-dom';
import type { Product } from '../types';

// ─── Category Color Map ───────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Clothing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Books: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Sports: 'bg-green-500/10 text-green-400 border-green-500/20',
  Home: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Grocery: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  Beauty: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Automotive: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Toys: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Furniture: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '💻',
  Clothing: '👗',
  Books: '📚',
  Sports: '⚽',
  Home: '🏠',
  Grocery: '🛒',
  Beauty: '✨',
  Automotive: '🚗',
  Toys: '🧸',
  Furniture: '🪑',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const categoryColor = CATEGORY_COLORS[product.category] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  const categoryIcon = CATEGORY_ICONS[product.category] ?? '📦';

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(product.price));

  const updatedDate = new Date(product.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/products/${product.id}`}
      className="glass-card p-5 flex flex-col gap-3 
                 hover:border-brand-500/50 hover:glow-blue
                 transition-all duration-300 ease-out
                 hover:-translate-y-0.5 group animate-fade-in"
      id={`product-${product.id}`}
    >
      {/* Category Badge */}
      <div className="flex items-center justify-between">
        <span className={`badge border ${categoryColor} gap-1`}>
          <span>{categoryIcon}</span>
          {product.category}
        </span>
        <span className="text-slate-500 text-xs">{updatedDate}</span>
      </div>

      {/* Product Name */}
      <h2 className="text-slate-100 font-semibold text-sm leading-snug
                     group-hover:text-brand-400 transition-colors duration-200
                     line-clamp-2">
        {product.name}
      </h2>

      {/* Price */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xl font-bold text-gradient">
          {formattedPrice}
        </span>
        <span className="text-xs text-slate-500 group-hover:text-brand-400 transition-colors">
          View details →
        </span>
      </div>
    </Link>
  );
}
