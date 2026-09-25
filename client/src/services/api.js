const API_BASE = '/api';

function getUserId() {
  return localStorage.getItem('codecraft_user_id') || 'usr_guest';
}

export function setUserId(id) {
  localStorage.setItem('codecraft_user_id', id);
}

const headers = () => ({
  'Content-Type': 'application/json',
  'x-user-id': getUserId()
});

export const api = {
  // Courses
  async getCourses() {
    const res = await fetch(`${API_BASE}/courses`);
    return res.json();
  },

  async getLesson(courseId, lessonId) {
    const res = await fetch(`${API_BASE}/courses/${courseId}/lesson/${lessonId}`);
    return res.json();
  },

  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  async getProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`);
    return res.json();
  },

  // Execution
  async runCode(language, code, stdin = '') {
    const res = await fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ language, code, stdin })
    });
    return res.json();
  },

  // AI Tutor
  async askAiTutor(language, question, code, currentError) {
    const res = await fetch(`${API_BASE}/ai/ask-tutor`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ language, question, code, currentError })
    });
    return res.json();
  },

  // User & Progress
  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: headers()
    });
    return res.json();
  },

  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  async completeLesson(lessonId, xp = 50) {
    const res = await fetch(`${API_BASE}/progress/complete-lesson`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ lessonId, xp })
    });
    return res.json();
  },

  async submitQuiz(lessonId, selectedOption, correctIndex, xpReward = 30) {
    const res = await fetch(`${API_BASE}/progress/submit-quiz`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ lessonId, selectedOption, correctIndex, xpReward })
    });
    return res.json();
  },

  async completeChallenge(lessonId, xpReward = 50) {
    const res = await fetch(`${API_BASE}/progress/complete-challenge`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ lessonId, xpReward })
    });
    return res.json();
  },

  async completeProject(projectId, xpReward = 150) {
    const res = await fetch(`${API_BASE}/progress/complete-project`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ projectId, xpReward })
    });
    return res.json();
  },

  async saveProjectDraft(projectId, code) {
    const res = await fetch(`${API_BASE}/progress/save-project-draft`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ projectId, code })
    });
    return res.json();
  }
};
