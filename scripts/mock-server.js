/**
 * Mock API Server — runs without a database
 * Serves fake product data so the frontend can be demoed instantly
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Generate fake products ───────────────────────────────────────────────────

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Sports', 'Home',
  'Grocery', 'Beauty', 'Automotive', 'Toys', 'Furniture',
];

const ADJECTIVES = [
  'Premium', 'Ultra', 'Smart', 'Pro', 'Elite', 'Advanced', 'Classic', 'Deluxe',
  'Essential', 'Supreme', 'Compact', 'Portable', 'Wireless', 'Digital', 'Eco',
  'Modern', 'Vintage', 'Luxury', 'Heavy-Duty', 'Lightweight', 'Sleek', 'Ergonomic',
];

const NOUNS = {
  Electronics: ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Speaker', 'Camera', 'Monitor', 'Keyboard', 'Smartwatch', 'Earbuds'],
  Clothing: ['T-Shirt', 'Jeans', 'Jacket', 'Dress', 'Shoes', 'Sneakers', 'Hoodie', 'Shorts', 'Blazer', 'Sweater'],
  Books: ['Novel', 'Textbook', 'Cookbook', 'Biography', 'Self-Help Guide', 'Science Fiction', 'Mystery Thriller', 'History Book'],
  Sports: ['Yoga Mat', 'Dumbbell', 'Tennis Racket', 'Football', 'Basketball', 'Running Shoes', 'Cycling Helmet', 'Jump Rope'],
  Home: ['Lamp', 'Pillow', 'Blanket', 'Curtain', 'Rug', 'Clock', 'Vase', 'Mirror', 'Shelf', 'Candle'],
  Grocery: ['Olive Oil', 'Pasta', 'Coffee Beans', 'Green Tea', 'Granola Bar', 'Protein Powder', 'Almond Milk', 'Honey'],
  Beauty: ['Moisturizer', 'Serum', 'Shampoo', 'Conditioner', 'Lipstick', 'Foundation', 'Mascara', 'Perfume', 'Sunscreen'],
  Automotive: ['Car Charger', 'Dash Cam', 'Floor Mat', 'Seat Cover', 'Jump Starter', 'Tire Inflator', 'GPS Navigator'],
  Toys: ['Building Blocks', 'Action Figure', 'Puzzle', 'Board Game', 'RC Car', 'Stuffed Animal', 'LEGO Set', 'Science Kit'],
  Furniture: ['Office Chair', 'Standing Desk', 'Bookshelf', 'Coffee Table', 'Sofa', 'Bed Frame', 'Nightstand', 'Dresser'],
};

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice() {
  return (Math.random() * 9999 + 0.99).toFixed(2);
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateProduct(category) {
  const cat = category || randomElement(CATEGORIES);
  const adj = randomElement(ADJECTIVES);
  const nouns = NOUNS[cat] || ['Product'];
  const noun = randomElement(nouns);
  const model = Math.floor(Math.random() * 9000 + 100);

  const created_at = randomDate(new Date('2022-01-01'), new Date());
  const updated_at = randomDate(created_at, new Date());

  return {
    id: uuidv4(),
    name: `${adj} ${noun} ${model}`,
    category: cat,
    price: randomPrice(),
    created_at: created_at.toISOString(),
    updated_at: updated_at.toISOString(),
  };
}

// Generate 500 fake products in memory
const ALL_PRODUCTS = Array.from({ length: 500 }, () => generateProduct());

// Sort by updated_at DESC, id DESC (like the real API)
ALL_PRODUCTS.sort((a, b) => {
  const diff = new Date(b.updated_at) - new Date(a.updated_at);
  if (diff !== 0) return diff;
  return b.id.localeCompare(a.id);
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString(), mode: 'MOCK' });
});

// GET /categories
app.get('/categories', (req, res) => {
  res.json({ status: 'success', data: { categories: CATEGORIES } });
});

// GET /products
app.get('/products', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const cursor = req.query.cursor;
  const category = req.query.category;

  // Filter by category
  let filtered = category
    ? ALL_PRODUCTS.filter(p => p.category === category)
    : ALL_PRODUCTS;

  // Apply cursor
  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));
      const idx = filtered.findIndex(p => p.id === decoded.id);
      if (idx !== -1) filtered = filtered.slice(idx + 1);
    } catch {
      return res.status(400).json({ status: 'error', statusCode: 400, message: 'Invalid cursor' });
    }
  }

  // Paginate (limit+1 trick)
  const page = filtered.slice(0, limit + 1);
  const hasMore = page.length > limit;
  const items = hasMore ? page.slice(0, limit) : page;

  let nextCursor = null;
  let nextCursorEncoded = null;

  if (hasMore && items.length > 0) {
    const last = items[items.length - 1];
    nextCursor = { updated_at: last.updated_at, id: last.id };
    nextCursorEncoded = Buffer.from(JSON.stringify(nextCursor)).toString('base64url');
  }

  res.json({
    status: 'success',
    data: { items, nextCursor, nextCursorEncoded },
  });
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
  const product = ALL_PRODUCTS.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ status: 'error', statusCode: 404, message: 'Product not found' });
  }
  res.json({ status: 'success', data: product });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 MOCK API server running!');
  console.log(`   API:      http://localhost:${PORT}`);
  console.log(`   Health:   http://localhost:${PORT}/health`);
  console.log(`   Products: http://localhost:${PORT}/products`);
  console.log('');
  console.log('   ⚠️  This is MOCK data (500 fake products)');
  console.log('   For real 200K products, set up DATABASE_URL and run: npm run seed');
  console.log('');
});
