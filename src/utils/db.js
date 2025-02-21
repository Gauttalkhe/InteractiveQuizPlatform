import { openDB } from 'idb';

const DB_NAME = 'quiz-platform';
const DB_VERSION = 1;

export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('attempts')) {
        db.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
}

export async function saveUser(user) {
  const db = await initDB();
  await db.put('users', user);
}

export async function getUser(id) {
  const db = await initDB();
  return db.get('users', id);
}

export async function saveAttempt(attempt) {
  const db = await initDB();
  await db.add('attempts', attempt);
}

export async function getUserAttempts(userId) {
  const db = await initDB();
  const attempts = await db.getAll('attempts');
  return attempts.filter(attempt => attempt.userId === userId);
}