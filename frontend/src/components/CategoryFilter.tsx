import type { ProductCategory } from '../types';
import { ALL_CATEGORIES } from '../types';

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

interface CategoryFilterProps {
  selected?: string;
  onChange: (category?: string) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      {/* "All" button */}
      <button
        id="category-all"
        onClick={() => onChange(undefined)}
        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-95
          ${!selected
            ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-600/25'
            : 'bg-surface-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
          }`}
      >
        All Products
      </button>

      {/* Category buttons */}
      {ALL_CATEGORIES.map((category: ProductCategory) => {
        const isActive = selected === category;
        return (
          <button
            key={category}
            id={`category-${category.toLowerCase()}`}
            onClick={() => onChange(isActive ? undefined : category)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-95 flex items-center gap-1.5
              ${isActive
                ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-600/25'
                : 'bg-surface-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
              }`}
          >
            <span>{CATEGORY_ICONS[category]}</span>
            {category}
          </button>
        );
      })}
    </div>
  );
}
