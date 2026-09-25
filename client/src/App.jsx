import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoadmapView from './components/RoadmapView';
import LessonView from './components/LessonView';
import ProjectsView from './components/ProjectsView';
import PlaygroundView from './components/PlaygroundView';
import AuthModal from './components/AuthModal';
import AiTutorModal from './components/AiTutorModal';
import { api } from './services/api';

export default function App() {
  const [currentTrack, setCurrentTrack] = useState('python'); // 'python' | 'cpp'
  const [currentTab, setCurrentTab] = useState('roadmap'); // 'roadmap' | 'projects' | 'playground'
  const [activeLesson, setActiveLesson] = useState(null); // { courseId, lessonId } | null

  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState({ language: 'python', code: '', currentError: null });

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    try {
      const [coursesData, userData] = await Promise.all([
        api.getCourses(),
        api.getMe()
      ]);
      setCourses(coursesData.courses || []);
      setUser(userData.user || null);
    } catch (e) {
      console.error('App init error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = (courseId, lessonId) => {
    setActiveLesson({ courseId, lessonId });
  };

  const handleOpenAiTutor = (language, code, currentError) => {
    setAiContext({ language, code, currentError });
    setIsAiOpen(true);
  };

  const activeCourse = courses.find(c => 
    currentTrack === 'python' ? c.language === 'python' : c.language === 'cpp'
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTrack={currentTrack}
        setCurrentTrack={(track) => {
          setCurrentTrack(track);
          setActiveLesson(null);
        }}
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setActiveLesson(null);
        }}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsAuthOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">正在進入 CodeCraft 學院...</span>
          </div>
        ) : activeLesson ? (
          <LessonView
            courseId={activeLesson.courseId}
            lessonId={activeLesson.lessonId}
            user={user}
            onBack={() => setActiveLesson(null)}
            onProgressUpdate={(updatedUser) => setUser(updatedUser)}
            onOpenAiTutor={handleOpenAiTutor}
          />
        ) : currentTab === 'roadmap' ? (
          <RoadmapView
            course={activeCourse}
            user={user}
            onSelectLesson={handleSelectLesson}
            onSwitchToProjects={() => setCurrentTab('projects')}
          />
        ) : currentTab === 'projects' ? (
          <ProjectsView
            user={user}
            onProgressUpdate={(updatedUser) => setUser(updatedUser)}
            onOpenAiTutor={handleOpenAiTutor}
          />
        ) : (
          <PlaygroundView
            onOpenAiTutor={handleOpenAiTutor}
          />
        )}
      </main>

      {/* Footer (only when not in full-screen lesson view) */}
      {!activeLesson && (
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">CodeCraft Academy</span>
              <span>•</span>
              <span>初學者到獨立開發者的一站式程式教育平台</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>🐍 Python 3.12 支援</span>
              <span>⚡ C++20 高效編譯</span>
              <span>🤖 智慧 AI 助教陪伴</span>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUserUpdate={(updatedUser) => setUser(updatedUser)}
      />

      <AiTutorModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        language={aiContext.language}
        code={aiContext.code}
        currentError={aiContext.currentError}
      />
    </div>
  );
}
