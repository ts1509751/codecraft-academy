const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Default initial state
const defaultData = {
  users: [
    {
      id: 'usr_guest',
      username: '新手探索者',
      email: 'guest@codecraft.edu',
      password: 'demo',
      xp: 120,
      streak: 3,
      completedLessons: ['py-101', 'cpp-101'],
      quizResults: {
        'py-101': { score: 100, passed: true },
        'cpp-101': { score: 100, passed: true }
      },
      completedChallenges: ['py-101', 'cpp-101'],
      completedProjects: [],
      projectDrafts: {},
      savedPlaygrounds: [
        {
          id: 'pg-1',
          title: 'Hello Python 測試',
          language: 'python',
          code: 'print("歡迎來到程式世界！")\nfor i in range(3):\n    print(f"第 {i+1} 次探索！")',
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    }
  ]
};

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db, falling back to default:', err);
    return defaultData;
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// User helpers
function findUserById(id) {
  const db = readDb();
  return db.users.find(u => u.id === id);
}

function findUserByUsername(username) {
  const db = readDb();
  return db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

function createUser({ username, email, password }) {
  const db = readDb();
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('此使用者名稱已被註冊');
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    username,
    email: email || '',
    password,
    xp: 0,
    streak: 1,
    completedLessons: [],
    quizResults: {},
    completedChallenges: [],
    completedProjects: [],
    projectDrafts: {},
    savedPlaygrounds: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

function updateUser(id, updates) {
  const db = readDb();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  db.users[index] = { ...db.users[index], ...updates };
  writeDb(db);
  return db.users[index];
}

function completeLesson(userId, lessonId, xpReward = 50) {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;

  let earnedXp = 0;
  if (!user.completedLessons.includes(lessonId)) {
    user.completedLessons.push(lessonId);
    user.xp = (user.xp || 0) + xpReward;
    earnedXp = xpReward;
  }
  writeDb(db);
  return { user, earnedXp };
}

function recordQuizResult(userId, lessonId, score, passed, xpReward = 30) {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;

  if (!user.quizResults) user.quizResults = {};
  const isFirstPass = !user.quizResults[lessonId]?.passed && passed;
  user.quizResults[lessonId] = { score, passed, date: new Date().toISOString() };

  let earnedXp = 0;
  if (isFirstPass) {
    user.xp = (user.xp || 0) + xpReward;
    earnedXp = xpReward;
  }

  writeDb(db);
  return { user, earnedXp };
}

function completeChallenge(userId, lessonId, xpReward = 50) {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;

  if (!user.completedChallenges) user.completedChallenges = [];
  let earnedXp = 0;
  if (!user.completedChallenges.includes(lessonId)) {
    user.completedChallenges.push(lessonId);
    user.xp = (user.xp || 0) + xpReward;
    earnedXp = xpReward;
  }

  writeDb(db);
  return { user, earnedXp };
}

function completeProject(userId, projectId, xpReward = 150) {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;

  if (!user.completedProjects) user.completedProjects = [];
  let earnedXp = 0;
  if (!user.completedProjects.includes(projectId)) {
    user.completedProjects.push(projectId);
    user.xp = (user.xp || 0) + xpReward;
    earnedXp = xpReward;
  }

  writeDb(db);
  return { user, earnedXp };
}

function saveProjectDraft(userId, projectId, code) {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;

  if (!user.projectDrafts) user.projectDrafts = {};
  user.projectDrafts[projectId] = code;
  writeDb(db);
  return { success: true };
}

module.exports = {
  findUserById,
  findUserByUsername,
  createUser,
  updateUser,
  completeLesson,
  recordQuizResult,
  completeChallenge,
  completeProject,
  saveProjectDraft
};
