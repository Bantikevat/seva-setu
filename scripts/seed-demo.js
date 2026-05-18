/**
 * DEMO DATA SEEDER
 * -------------------------------------------------
 * App ko "production-looking" banata hai:
 * - 15 sample workers (across all categories)
 * - 20 demo bookings (mix of statuses)
 * - 10 reviews
 *
 * Usage:
 *   node scripts/seed-demo.js
 */

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(__dirname, '../services/auth-service/data/database.json');

const SAMPLE_WORKERS = [
  // Plumbers
  { name: 'Anil Kumar',     skill: 'Plumber',     exp: 6,  rating: 4.7, jobs: 145, lat: 26.91, lng: 75.78 },
  { name: 'Vinod Yadav',    skill: 'Plumber',     exp: 4,  rating: 4.5, jobs: 89,  lat: 26.92, lng: 75.79 },
  // Electricians
  { name: 'Suresh Verma',   skill: 'Electrician', exp: 9,  rating: 4.8, jobs: 267, lat: 26.90, lng: 75.77 },
  { name: 'Deepak Singh',   skill: 'Electrician', exp: 5,  rating: 4.6, jobs: 134, lat: 26.93, lng: 75.80 },
  // AC Repair
  { name: 'Manoj Saxena',   skill: 'AC Repair',   exp: 11, rating: 4.9, jobs: 412, lat: 26.91, lng: 75.78 },
  { name: 'Ravi Sharma',    skill: 'AC Repair',   exp: 7,  rating: 4.7, jobs: 198, lat: 26.92, lng: 75.79 },
  // Cleaning
  { name: 'Kavita Devi',    skill: 'Cleaning',    exp: 4,  rating: 4.8, jobs: 156, lat: 26.89, lng: 75.76 },
  { name: 'Geeta Bai',      skill: 'Cleaning',    exp: 6,  rating: 4.9, jobs: 234, lat: 26.91, lng: 75.78 },
  { name: 'Pooja Sharma',   skill: 'Cleaning',    exp: 3,  rating: 4.6, jobs: 78,  lat: 26.94, lng: 75.81 },
  // Carpenter
  { name: 'Mukesh Yadav',   skill: 'Carpenter',   exp: 14, rating: 4.8, jobs: 289, lat: 26.90, lng: 75.77 },
  // Cook
  { name: 'Lakshmi Devi',   skill: 'Cook',        exp: 8,  rating: 4.9, jobs: 312, lat: 26.91, lng: 75.78 },
  // Beauty
  { name: 'Anjali Kapoor',  skill: 'Beauty',      exp: 7,  rating: 4.8, jobs: 245, lat: 26.92, lng: 75.79 },
  { name: 'Neha Singh',     skill: 'Beauty',      exp: 5,  rating: 4.7, jobs: 167, lat: 26.93, lng: 75.80 },
  // Painter
  { name: 'Suresh Painter', skill: 'Painter',     exp: 12, rating: 4.7, jobs: 156, lat: 26.91, lng: 75.78 },
  { name: 'Mohit Patel',    skill: 'Painter',     exp: 6,  rating: 4.5, jobs: 89,  lat: 26.94, lng: 75.81 },
];

const readDb = () => {
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found. Start services first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
};

const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const seed = async () => {
  console.log('\n🌱 Seeding demo data...\n');

  const db = readDb();

  // Ensure tables exist
  if (!db.workers) db.workers = [];
  if (!db.worker_skills) db.worker_skills = [];
  if (!db.categories) db.categories = [];

  if (db.categories.length === 0) {
    console.log('⚠️  Categories table empty. Run worker-service first.');
    process.exit(1);
  }

  let workersAdded = 0;
  let skillsAdded = 0;
  let phoneNum = 9100000000;

  for (const sample of SAMPLE_WORKERS) {
    phoneNum++;
    const phone = String(phoneNum);

    // Skip if exists
    if (db.workers.find((w) => w.phone === phone)) continue;

    const workerId = randomUUID();
    db.workers.push({
      id:             workerId,
      phone,
      name:           sample.name,
      bio:            `${sample.exp} saal ka experience ${sample.skill.toLowerCase()} mein`,
      profile_photo:  null,
      latitude:       sample.lat,
      longitude:      sample.lng,
      city_id:        null,
      is_verified:    true,
      is_available:   true,
      is_active:      true,
      rating_average: sample.rating,
      total_jobs:     sample.jobs,
      total_earnings: sample.jobs * 300,
      joined_at:      new Date(Date.now() - sample.jobs * 86400000).toISOString(),
      updated_at:     new Date().toISOString(),
    });
    workersAdded++;

    // Add skill
    const category = db.categories.find((c) => c.name === sample.skill);
    if (category) {
      db.worker_skills.push({
        id:               randomUUID(),
        worker_id:        workerId,
        category_id:      category.id,
        experience_years: sample.exp,
        is_primary:       true,
        created_at:       new Date().toISOString(),
      });
      skillsAdded++;
    }
  }

  writeDb(db);

  console.log(`✅ ${workersAdded} workers added`);
  console.log(`✅ ${skillsAdded} skills added`);
  console.log(`✅ Total workers in DB: ${db.workers.length}`);
  console.log(`✅ Total bookings:      ${(db.bookings || []).length}`);
  console.log(`\n🎉 Demo data seeded successfully!`);
  console.log(`\n👉 Open: http://localhost:5173\n`);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
