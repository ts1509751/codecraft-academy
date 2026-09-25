const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { runPython } = require('./runner/pythonRunner');
const { runCpp } = require('./runner/cppRunner');
const pythonCourse = require('./courses/python_course');
const cppCourse = require('./courses/cpp_course');
const projectsCatalog = require('./courses/projects_catalog');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- COURSES API ---
app.get('/api/courses', (req, res) => {
  res.json({
    courses: [
      {
        id: pythonCourse.id,
        title: pythonCourse.title,
        description: pythonCourse.description,
        language: pythonCourse.language,
        totalXp: pythonCourse.totalXp,
        levelCount: pythonCourse.levels.length,
        levels: pythonCourse.levels.map(l => ({
          id: l.id,
          stage: l.stage,
          title: l.title,
          summary: l.summary,
          estimatedMinutes: l.estimatedMinutes,
          xp: l.xp
        }))
      },
      {
        id: cppCourse.id,
        title: cppCourse.title,
        description: cppCourse.description,
        language: cppCourse.language,
        totalXp: cppCourse.totalXp,
        levelCount: cppCourse.levels.length,
        levels: cppCourse.levels.map(l => ({
          id: l.id,
          stage: l.stage,
          title: l.title,
          summary: l.summary,
          estimatedMinutes: l.estimatedMinutes,
          xp: l.xp
        }))
      }
    ]
  });
});

app.get('/api/courses/:courseId/lesson/:lessonId', (req, res) => {
  const { courseId, lessonId } = req.params;
  const course = courseId === 'python-mastery' ? pythonCourse : (courseId === 'cpp-mastery' ? cppCourse : null);

  if (!course) {
    return res.status(404).json({ error: '找不到該課程' });
  }

  const lesson = course.levels.find(l => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ error: '找不到該課綱關卡' });
  }

  res.json({
    courseId: course.id,
    courseTitle: course.title,
    language: course.language,
    lesson
  });
});

app.get('/api/projects', (req, res) => {
  res.json({ projects: projectsCatalog });
});

app.get('/api/projects/:projectId', (req, res) => {
  const project = projectsCatalog.find(p => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ error: '找不到該專案' });
  }
  res.json({ project });
});

// --- CODE EXECUTION API ---
app.post('/api/run', async (req, res) => {
  const { language, code, stdin = '' } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: '請提供要執行的程式碼' });
  }

  try {
    let result;
    if (language === 'python') {
      result = await runPython(code, stdin);
    } else if (language === 'cpp' || language === 'c++') {
      result = await runCpp(code, stdin);
    } else {
      return res.status(400).json({ error: '不支援的程式語言，目前支援 python 與 cpp' });
    }

    res.json(result);
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({
      success: false,
      stdout: '',
      stderr: '執行服務發生未預期錯誤: ' + err.message,
      executionTime: 0,
      tips: null
    });
  }
});

// --- AUTH & USER PROFILE API ---
app.get('/api/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_guest';
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: '使用者不存在' });
  }
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: '請輸入使用者名稱' });
  }

  let user = db.findUserByUsername(username);
  if (!user) {
    // Auto-create for friendly zero-friction onboarding if user wants
    try {
      user = db.createUser({ username, email: '', password: password || '123456' });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, message: '登入成功' });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username) return res.status(400).json({ error: '請提供使用者名稱' });

  try {
    const user = db.createUser({ username, email, password: password || '123456' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, message: '註冊成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- PROGRESS TRACKING API ---
app.post('/api/progress/complete-lesson', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_guest';
  const { lessonId, xp = 50 } = req.body;
  const result = db.completeLesson(userId, lessonId, xp);
  if (!result) return res.status(404).json({ error: '更新失敗' });
  res.json(result);
});

app.post('/api/progress/submit-quiz', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_guest';
  const { lessonId, selectedOption, correctIndex, xpReward = 30 } = req.body;

  const passed = selectedOption === correctIndex;
  const score = passed ? 100 : 0;
  const result = db.recordQuizResult(userId, lessonId, score, passed, xpReward);
  if (!result) return res.status(404).json({ error: '更新失敗' });

  res.json({
    passed,
    score,
    earnedXp: result.earnedXp,
    user: result.user
  });
});

app.post('/api/progress/complete-challenge', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_guest';
  const { lessonId, xpReward = 50 } = req.body;
  const result = db.completeChallenge(userId, lessonId, xpReward);
  if (!result) return res.status(404).json({ error: '更新失敗' });
  res.json(result);
});

app.post('/api/progress/complete-project', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_guest';
  const { projectId, xpReward = 150 } = req.body;
  const result = db.completeProject(userId, projectId, xpReward);
  if (!result) return res.status(404).json({ error: '更新失敗' });
  res.json(result);
});

app.post('/api/progress/save-project-draft', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_guest';
  const { projectId, code } = req.body;
  const result = db.saveProjectDraft(userId, projectId, code);
  res.json(result);
});

// --- AI TUTOR COACHING ADVICE ---
app.post('/api/ai/ask-tutor', (req, res) => {
  const { language, question, code, currentError } = req.body;

  let advice = '';
  if (currentError) {
    if (language === 'python') {
      advice = `助教發現了這段報錯訊息：\n「${currentError}」\n\n💡 助教指引小撇步：\n1. 請先對照錯誤發生的行號。\n2. 初學 Python 最常忘記的是「冒號 :」與「縮排一致性」，檢查每層是否都剛好縮排 4 個空格。\n3. 如果是變數名稱錯誤，請仔細比對大小寫是否有拼錯喔！加油，除錯是成為優秀工程師的必經之路！`;
    } else {
      advice = `助教觀察到編譯器回報了錯誤訊息：\n「${currentError}」\n\n💡 助教指引小撇步：\n1. C++ 對語法非常嚴謹，首先檢查該行或上一行末端是否漏打了分號 \`;\`。\n2. 若缺少 cout/cin，確認是否有加入 \`#include <iostream>\` 與 \`using namespace std;\`。\n3. 檢查變數型態是否宣告正確且數值是否相符。`;
    }
  } else {
    advice = `💡 助教提示：這道練習考驗的是將大問題拆解為小步驟的能力！先試著用口語列出流程：\n1. 需要宣告哪些變數來裝資料？\n2. 什麼情況需要做條件判斷？\n3. 是否需要迴圈來重複執行？\n一步一步慢慢來，寫出你的第一行程式碼試跑看看吧！`;
  }

  res.json({ advice });
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 CodeCraft Academy 後端伺服器運作於 port ${PORT}`);
  console.log(`🔗 API 根路徑: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});
