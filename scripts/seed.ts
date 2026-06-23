import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_PRODUCTS = 200_000;
const BATCH_SIZE = 10_000;

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Sports',
  'Home',
  'Grocery',
  'Beauty',
  'Automotive',
  'Toys',
  'Furniture',
] as const;

const ADJECTIVES = [
  'Premium', 'Ultra', 'Smart', 'Pro', 'Elite', 'Advanced', 'Classic', 'Deluxe',
  'Essential', 'Supreme', 'Compact', 'Portable', 'Wireless', 'Digital', 'Eco',
  'Modern', 'Vintage', 'Luxury', 'Budget', 'Heavy-Duty', 'Lightweight', 'Sleek',
  'Ergonomic', 'Durable', 'Professional', 'Organic', 'Natural', 'Certified',
];

const NOUNS: Record<string, string[]> = {
  Electronics: [
    'Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Speaker', 'Camera',
    'Monitor', 'Keyboard', 'Mouse', 'Charger', 'Cable', 'Router', 'Drone',
    'Smartwatch', 'Earbuds', 'Webcam', 'Microphone', 'Gaming Console', 'TV',
  ],
  Clothing: [
    'T-Shirt', 'Jeans', 'Jacket', 'Dress', 'Shoes', 'Sneakers', 'Hoodie',
    'Shorts', 'Blazer', 'Sweater', 'Coat', 'Skirt', 'Socks', 'Hat', 'Belt',
    'Scarf', 'Gloves', 'Suit', 'Boots', 'Sandals',
  ],
  Books: [
    'Novel', 'Textbook', 'Cookbook', 'Biography', 'Self-Help Guide',
    'Science Fiction', 'Fantasy', 'Mystery Thriller', 'History Book',
    'Programming Guide', 'Art Book', 'Travel Guide', 'Children\'s Book',
    'Poetry Collection', 'Philosophy Book',
  ],
  Sports: [
    'Yoga Mat', 'Dumbbell', 'Tennis Racket', 'Football', 'Basketball',
    'Running Shoes', 'Cycling Helmet', 'Swimming Goggles', 'Jump Rope',
    'Resistance Band', 'Treadmill', 'Kettlebell', 'Sports Bag', 'Water Bottle',
  ],
  Home: [
    'Lamp', 'Pillow', 'Blanket', 'Curtain', 'Rug', 'Clock', 'Vase',
    'Mirror', 'Shelf', 'Organizer', 'Candle', 'Frame', 'Basket', 'Towel',
    'Plant Pot', 'Humidifier', 'Air Purifier',
  ],
  Grocery: [
    'Olive Oil', 'Pasta', 'Rice', 'Coffee Beans', 'Green Tea', 'Granola Bar',
    'Protein Powder', 'Almond Milk', 'Dark Chocolate', 'Honey', 'Cereal',
    'Canned Beans', 'Spice Mix', 'Fruit Juice', 'Sparkling Water',
  ],
  Beauty: [
    'Moisturizer', 'Serum', 'Shampoo', 'Conditioner', 'Lipstick', 'Foundation',
    'Mascara', 'Perfume', 'Face Mask', 'Body Lotion', 'Sunscreen', 'Nail Polish',
    'Eye Cream', 'Toner', 'Cleanser',
  ],
  Automotive: [
    'Car Charger', 'Dash Cam', 'Floor Mat', 'Seat Cover', 'Air Freshener',
    'Jump Starter', 'Tire Inflator', 'GPS Navigator', 'Car Cover', 'Steering Wheel',
    'LED Light Kit', 'Phone Mount', 'Emergency Kit',
  ],
  Toys: [
    'Building Blocks', 'Action Figure', 'Puzzle', 'Board Game', 'RC Car',
    'Stuffed Animal', 'LEGO Set', 'Doll', 'Science Kit', 'Art Set',
    'Bike', 'Scooter', 'Kite', 'Frisbee', 'Card Game',
  ],
  Furniture: [
    'Office Chair', 'Standing Desk', 'Bookshelf', 'Coffee Table', 'Sofa',
    'Bed Frame', 'Nightstand', 'Dresser', 'Dining Table', 'Bar Stool',
    'Ottoman', 'TV Stand', 'Cabinet', 'Wardrobe', 'Bench',
  ],
};

// ─── Utility Functions ────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomPrice(): Prisma.Decimal {
  // Price between $0.99 and $9,999.99
  const price = (Math.random() * 9999 + 0.99).toFixed(2);
  return new Prisma.Decimal(price);
}

function randomTimestamp(startDate: Date, endDate: Date): Date {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
}

function generateProductName(category: string): string {
  const adj = randomElement(ADJECTIVES);
  const nouns = NOUNS[category] ?? ['Product'];
  const noun = randomElement(nouns);
  const model = randomInt(100, 9999);
  return `${adj} ${noun} ${model}`;
}

interface ProductData {
  id: string;
  name: string;
  category: string;
  price: Prisma.Decimal;
  created_at: Date;
  updated_at: Date;
}

function generateBatch(size: number, startDate: Date, endDate: Date): ProductData[] {
  const batch: ProductData[] = [];

  for (let i = 0; i < size; i++) {
    const category = randomElement(CATEGORIES);
    const created_at = randomTimestamp(startDate, endDate);
    // updated_at is between created_at and endDate
    const updated_at = randomTimestamp(created_at, endDate);

    batch.push({
      id: uuidv4(),
      name: generateProductName(category),
      category,
      price: randomPrice(),
      created_at,
      updated_at,
    });
  }

  return batch;
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('🌱 Starting seed script...');
  console.log(`📦 Target: ${TOTAL_PRODUCTS.toLocaleString()} products`);
  console.log(`🔢 Batch size: ${BATCH_SIZE.toLocaleString()} rows per insert`);
  console.log('');

  // Clear existing data
  console.log('🗑️  Clearing existing products...');
  const deleteResult = await prisma.product.deleteMany();
  console.log(`   Deleted ${deleteResult.count.toLocaleString()} existing products`);

  const totalBatches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);
  const startDate = new Date('2022-01-01T00:00:00Z');
  const endDate = new Date();

  let totalInserted = 0;
  const startTime = Date.now();

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - totalInserted);
    const batchData = generateBatch(currentBatchSize, startDate, endDate);

    await prisma.product.createMany({
      data: batchData,
      skipDuplicates: false,
    });

    totalInserted += currentBatchSize;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const progress = ((totalInserted / TOTAL_PRODUCTS) * 100).toFixed(1);
    const batchNum = batchIndex + 1;

    console.log(
      `   [${batchNum}/${totalBatches}] Inserted ${totalInserted.toLocaleString()} / ${TOTAL_PRODUCTS.toLocaleString()} products (${progress}%) — ${elapsed}s elapsed`,
    );
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log('✅ Seed complete!');
  console.log(`   Total products: ${totalInserted.toLocaleString()}`);
  console.log(`   Total time:     ${totalTime}s`);

  // Print category distribution
  console.log('\n📊 Category distribution:');
  const counts = await prisma.product.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { category: 'asc' },
  });

  for (const row of counts) {
    console.log(`   ${row.category.padEnd(15)} ${row._count.id.toLocaleString()}`);
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
