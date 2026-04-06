import { initializeDb, db } from './db.js';

initializeDb();

// Create users
const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (existingUsers.count === 0) {
  db.prepare('INSERT INTO users (name, avatar_emoji) VALUES (?, ?)').run('Marc', '💪');
  db.prepare('INSERT INTO users (name, avatar_emoji) VALUES (?, ?)').run('Partner', '✨');
  console.log('Created user profiles');
}

// Create sample affirmations
const existingAffirmations = db.prepare('SELECT COUNT(*) as count FROM affirmations').get() as { count: number };
if (existingAffirmations.count === 0) {
  const insert = db.prepare(
    'INSERT INTO affirmations (title, body, cadence, schedule_day, sort_order) VALUES (?, ?, ?, ?, ?)'
  );

  insert.run(
    'Morning Gratitude',
    `- I am grateful for this new day and all the opportunities it brings\n- I am thankful for the love and support in my life\n- I appreciate my health, my home, and my ability to grow\n- Every challenge I face is an opportunity to become stronger`,
    'daily',
    null,
    1
  );

  insert.run(
    'Self-Worth & Confidence',
    `- I am enough, exactly as I am right now\n- I trust myself to make good decisions\n- I am worthy of love, success, and happiness\n- My voice matters and my contributions are valuable\n- I release the need for approval from others`,
    'daily',
    null,
    2
  );

  insert.run(
    'Abundance & Prosperity',
    `- I am open to receiving abundance in all areas of my life\n- Money flows to me easily and effortlessly\n- I am creating the life of my dreams, one step at a time\n- I deserve financial freedom and I am working toward it every day`,
    'daily',
    null,
    3
  );

  insert.run(
    'Relationship Affirmations',
    `- We grow stronger together every single day\n- I choose love, patience, and understanding in my relationship\n- We communicate openly and honestly with each other\n- Our love is a safe space for both of us to be our authentic selves\n- I am grateful for my partner and the life we are building together`,
    'daily',
    null,
    4
  );

  insert.run(
    'Weekly Reflection',
    `- I celebrate the progress I made this week, no matter how small\n- I release anything that no longer serves me\n- I set intentions for the week ahead with clarity and purpose\n- I am proud of who I am becoming`,
    'weekly',
    0,
    5
  );

  console.log('Created sample affirmations');
}

console.log('Seed complete!');
process.exit(0);
