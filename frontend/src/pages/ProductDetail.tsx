import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';
import { PageLoader } from '../components/Spinner';

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '💻', Clothing: '👗', Books: '📚', Sports: '⚽', Home: '🏠',
  Grocery: '🛒', Beauty: '✨', Automotive: '🚗', Toys: '🧸', Furniture: '🪑',
};

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: 'from-blue-600/20 to-blue-400/5',
  Clothing: 'from-purple-600/20 to-purple-400/5',
  Books: 'from-amber-600/20 to-amber-400/5',
  Sports: 'from-green-600/20 to-green-400/5',
  Home: 'from-rose-600/20 to-rose-400/5',
  Grocery: 'from-lime-600/20 to-lime-400/5',
  Beauty: 'from-pink-600/20 to-pink-400/5',
  Automotive: 'from-orange-600/20 to-orange-400/5',
  Toys: 'from-cyan-600/20 to-cyan-400/5',
  Furniture: 'from-teal-600/20 to-teal-400/5',
};

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProduct(id ?? '');

  if (isLoading) return <PageLoader />;

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-slate-400 mb-6">{error ?? 'This product does not exist'}</p>
          <Link to="/" className="btn-primary" id="back-to-catalog">
            ← Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(product.price));

  const gradient = CATEGORY_COLORS[product.category] ?? 'from-brand-600/20 to-brand-400/5';
  const icon = CATEGORY_ICONS[product.category] ?? '📦';

  return (
    <div className="min-h-screen bg-surface-900">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-surface-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors text-sm font-medium"
            id="back-link"
          >
            ← Back to Catalog
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ─── Product Hero ────────────────────────────────────────────── */}
        <div className={`relative rounded-3xl bg-gradient-to-br ${gradient} p-8 mb-8 
                         border border-slate-700/50 overflow-hidden animate-slide-up`}>
          {/* Background icon */}
          <div className="absolute right-8 top-6 text-8xl opacity-10 select-none pointer-events-none">
            {icon}
          </div>

          {/* Category badge */}
          <div className="mb-4">
            <span className="badge bg-surface-800/80 border border-slate-600 text-slate-300 gap-1.5">
              <span className="text-base">{icon}</span>
              {product.category}
            </span>
          </div>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 max-w-xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="inline-flex items-baseline gap-1">
            <span className="text-5xl font-black text-gradient">{formattedPrice}</span>
          </div>
        </div>

        {/* ─── Details Card ────────────────────────────────────────────── */}
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-200 mb-5">Product Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow label="Product ID" value={product.id} mono />
            <DetailRow label="Category" value={`${icon} ${product.category}`} />
            <DetailRow label="Price" value={formattedPrice} />
            <DetailRow
              label="Created"
              value={new Date(product.created_at).toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            />
            <DetailRow
              label="Last Updated"
              value={new Date(product.updated_at).toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            />
          </dl>
        </div>

        {/* ─── Actions ────────────────────────────────────────────────── */}
        <div className="mt-6 flex gap-3">
          <Link to="/" className="btn-primary" id="browse-more-btn">
            Browse More Products
          </Link>
          <Link
            to={`/?category=${product.category}`}
            className="btn-secondary"
            id="same-category-btn"
          >
            More in {product.category}
          </Link>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function DetailRow({ label, value, mono = false }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className={`text-slate-200 text-sm ${mono ? 'font-mono text-xs text-slate-400 break-all' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
