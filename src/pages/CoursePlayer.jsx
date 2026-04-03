import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Circle, Play, Loader2, Trophy, Lock
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ProgressBar from '../components/ProgressBar';

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ completedLessons: [], percentage: 0, isCompleted: false });
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [courseRes, enrollRes] = await Promise.all([
          api.get(`/api/courses/${id}`),
          api.get(`/api/enrollment/check/${id}`)
        ]);

        if (!enrollRes.data.isEnrolled) {
          toast.error('Please enroll in this course first.');
          navigate(`/courses/${id}`);
          return;
        }

        setCourse(courseRes.data.course);
        setIsEnrolled(true);

        const progRes = await api.get(`/api/enrollment/progress/${id}`);
        setProgress(progRes.data || { completedLessons: [], percentage: 0, isCompleted: false });

        // Start at first incomplete lesson
        const completedArr = progRes.data?.completedLessons || [];
        const totalLessons = courseRes.data.course.lessons.length;
        const firstIncomplete = Array.from({ length: totalLessons }, (_, i) => i).find(
          (i) => !completedArr.includes(i)
        );
        setCurrentLessonIndex(firstIncomplete !== undefined ? firstIncomplete : 0);
      } catch (err) {
        toast.error('Could not load course. Please try again.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const markComplete = async () => {
    if (marking) return;
    const alreadyDone = progress.completedLessons.includes(currentLessonIndex);
    if (alreadyDone) {
      toast('Already marked as complete!', { icon: '✓' });
      return;
    }

    setMarking(true);
    try {
      const { data } = await api.patch(`/api/enrollment/progress/${id}`, {
        lessonIndex: currentLessonIndex
      });

      setProgress({
        completedLessons: data.completedLessons,
        percentage: data.percentage,
        isCompleted: data.isCompleted
      });

      if (data.isCompleted) {
        toast.success('🎉 Course completed! Congratulations!', { duration: 5000 });
      } else {
        toast.success('Lesson marked as complete!');
        // Auto-advance to next lesson
        const nextIndex = currentLessonIndex + 1;
        if (nextIndex < course.lessons.length) {
          setCurrentLessonIndex(nextIndex);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark lesson as complete.');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/50 text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const currentLesson = course.lessons[currentLessonIndex];
  const isCurrentDone = progress.completedLessons.includes(currentLessonIndex);

  return (
    <div className="page-container">
      {/* ─── Top bar ────────────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 glass-strong border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{course.title}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-white/50 text-xs hidden sm:block">
              {progress.completedLessons.length}/{course.lessons.length} lessons
            </span>
            <div className="w-24 sm:w-36">
              <ProgressBar percentage={progress.percentage} />
            </div>
            <span className="text-purple-400 font-bold text-sm">{progress.percentage}%</span>
          </div>
        </div>
      </div>

      {/* ─── Main layout ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* ─── Video + lesson info ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Completion banner */}
          {progress.isCompleted && (
            <div
              className="rounded-2xl p-5 mb-5 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.1) 100%)',
                border: '1px solid rgba(16,185,129,0.3)'
              }}
            >
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg">Course Completed!</p>
              <p className="text-white/60 text-sm mt-1">You've mastered all {course.lessons.length} lessons. Amazing work!</p>
            </div>
          )}

          {/* YouTube iframe player */}
          <div className="rounded-2xl overflow-hidden bg-black aspect-video mb-5 shadow-2xl">
            {currentLesson?.videoId ? (
              <iframe
                key={`${currentLesson.videoId}-${currentLessonIndex}`}
                src={`https://www.youtube.com/embed/${currentLesson.videoId}?rel=0&modestbranding=1&showinfo=0`}
                title={currentLesson.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <Play className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Lesson header */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/40 text-sm">Lesson {currentLessonIndex + 1} of {course.lessons.length}</span>
                  {isCurrentDone && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
                <h2 className="text-white font-bold text-xl leading-snug safe-text">{currentLesson?.title}</h2>
                {currentLesson?.description && (
                  <p className="text-white/55 text-sm mt-2 safe-text">{currentLesson.description}</p>
                )}
              </div>

              {/* Mark complete button */}
              <button
                onClick={markComplete}
                disabled={marking || isCurrentDone}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shrink-0 ${
                  isCurrentDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'btn-primary disabled:opacity-60 disabled:cursor-not-allowed'
                }`}
              >
                {marking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrentDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 shrink-0" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            </div>

            {/* Lesson navigation */}
            <div className="flex gap-3 mt-5 pt-5 border-t border-white/10">
              <button
                onClick={() => setCurrentLessonIndex((i) => Math.max(0, i - 1))}
                disabled={currentLessonIndex === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium glass border border-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentLessonIndex((i) => Math.min(course.lessons.length - 1, i + 1))}
                disabled={currentLessonIndex === course.lessons.length - 1}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium glass border border-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* ─── Lesson sidebar ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="glass-card rounded-2xl overflow-hidden lg:sticky lg:top-36">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-bold text-sm">Course Lessons</h3>
              <p className="text-white/40 text-xs mt-0.5">
                {progress.completedLessons.length}/{course.lessons.length} completed
              </p>
              <div className="mt-2">
                <ProgressBar percentage={progress.percentage} />
              </div>
            </div>

            <div
              className="overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 280px)' }}
            >
              {course.lessons.map((lesson, i) => {
                const done = progress.completedLessons.includes(i);
                const isCurrent = i === currentLessonIndex;

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentLessonIndex(i)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-b border-white/5 last:border-0 ${
                      isCurrent
                        ? 'bg-purple-500/15 border-l-2 border-l-purple-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Status icon */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      done
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-purple-500/30 text-purple-400'
                        : 'bg-white/5 text-white/30'
                    }`}>
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${
                        isCurrent ? 'text-purple-300' : done ? 'text-white/60' : 'text-white/75'
                      }`}>
                        <span className="text-white/30 mr-1">{i + 1}.</span>
                        <span className="line-clamp-2">{lesson.title}</span>
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">{lesson.duration}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
