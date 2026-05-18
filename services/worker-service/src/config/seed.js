/**
 * SEED DATA — Initial categories and workers
 * -------------------------------------------------
 * Pehli baar run hone pe yeh data create karta hai.
 * Dobara nahi banata — duplicate check karta hai.
 */

const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const logger = require('../utils/logger');

const seedCategories = [
  { name: 'Plumber',     name_hindi: 'प्लंबर',          emoji: '🔧', base_price: 299 },
  { name: 'Electrician', name_hindi: 'इलेक्ट्रीशियन',  emoji: '⚡', base_price: 349 },
  { name: 'AC Repair',   name_hindi: 'एसी मरम्मत',      emoji: '❄️', base_price: 499 },
  { name: 'Cleaning',    name_hindi: 'सफाई',             emoji: '🧹', base_price: 249 },
  { name: 'Carpenter',   name_hindi: 'बढ़ई',             emoji: '🪚', base_price: 399 },
  { name: 'Cook',        name_hindi: 'रसोइया',           emoji: '👨‍🍳', base_price: 499 },
  { name: 'Beauty',      name_hindi: 'ब्यूटीशियन',     emoji: '💆', base_price: 599 },
  { name: 'Painter',     name_hindi: 'पेंटर',            emoji: '🎨', base_price: 699 },
];

const seedWorkers = [
  {
    phone:          '9000000001',
    name:           'Rajesh Kumar',
    bio:            '8 saal ka experience plumbing aur pipe repair mein',
    skill:          'Plumber',
    experience:     8,
    rating_average: 4.9,
    total_jobs:     234,
    latitude:       23.1765,
    longitude:      75.7885,
  },
  {
    phone:          '9000000002',
    name:           'Sunita Devi',
    bio:            'Ghar safai aur deep cleaning specialist',
    skill:          'Cleaning',
    experience:     5,
    rating_average: 4.8,
    total_jobs:     189,
    latitude:       23.1820,
    longitude:      75.7950,
  },
  {
    phone:          '9000000003',
    name:           'Mohan Singh',
    bio:            'Master electrician - wiring, switches, fans',
    skill:          'Electrician',
    experience:     10,
    rating_average: 5.0,
    total_jobs:     312,
    latitude:       23.1690,
    longitude:      75.7800,
  },
  {
    phone:          '9000000004',
    name:           'Ramesh Sharma',
    bio:            'Furniture making, repair, polish ka kaam',
    skill:          'Carpenter',
    experience:     12,
    rating_average: 4.7,
    total_jobs:     156,
    latitude:       23.1840,
    longitude:      75.7950,
  },
  {
    phone:          '9000000005',
    name:           'Priya Nair',
    bio:            'Beauty, makeup, hair styling at home',
    skill:          'Beauty',
    experience:     6,
    rating_average: 4.9,
    total_jobs:     278,
    latitude:       23.1900,
    longitude:      75.7850,
  },
  {
    phone:          '9000000006',
    name:           'Vijay Patel',
    bio:            'House painting, wall texture, designs',
    skill:          'Painter',
    experience:     7,
    rating_average: 4.6,
    total_jobs:     98,
    latitude:       23.1720,
    longitude:      75.7900,
  },
];

const seedDatabase = async () => {
  // Skip seeding for Postgres — schema.sql already seeds categories
  if (db.USE_PG) {
    logger.info('✅ Using PostgreSQL — seeding skipped (categories pre-seeded via schema.sql)');
    return;
  }

  const existingCats = db.getAllCategories();

  // Skip if already seeded
  if (existingCats.length > 0) {
    logger.info(`✅ Database already seeded (${existingCats.length} categories)`);
    return;
  }

  // Create categories
  const categoryMap = {};
  for (const cat of seedCategories) {
    const newCat = {
      id:         uuidv4(),
      name:       cat.name,
      name_hindi: cat.name_hindi,
      emoji:      cat.emoji,
      base_price: cat.base_price,
      is_active:  true,
      created_at: new Date().toISOString(),
    };
    db.createCategory(newCat);
    categoryMap[cat.name] = newCat.id;
  }

  logger.info(`✅ Seeded ${seedCategories.length} categories`);

  // Create workers + skills
  let workersCreated = 0;

  for (const w of seedWorkers) {
    // Skip if exists
    if (db.findWorkerByPhone(w.phone)) continue;

    const workerId = uuidv4();
    const categoryId = categoryMap[w.skill];

    db.createWorker({
      id:             workerId,
      phone:          w.phone,
      name:           w.name,
      bio:            w.bio,
      profile_photo:  null,
      latitude:       w.latitude,
      longitude:      w.longitude,
      city_id:        null,
      is_verified:    true,
      is_available:   true,
      is_active:      true,
      rating_average: w.rating_average,
      total_jobs:     w.total_jobs,
      total_earnings: w.total_jobs * 300,
      joined_at:      new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    });

    // Add primary skill
    if (categoryId) {
      db.addWorkerSkill({
        id:               uuidv4(),
        worker_id:        workerId,
        category_id:      categoryId,
        experience_years: w.experience,
        is_primary:       true,
        created_at:       new Date().toISOString(),
      });
    }

    workersCreated++;
  }

  logger.info(`✅ Seeded ${workersCreated} workers with skills`);
};

module.exports = { seedDatabase };
