import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Users, Clock, BookOpen, Play, Lock, Loader2,
  CheckCircle2, ChevronRight, CreditCard, Zap
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ProgressBar from '../components/ProgressBar';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, enrollRes] = await Promise.all([
          api.get(`/api/courses/${id}`),
          api.get(`/api/enrollment/check/${id}`)
        ]);
        setCourse(courseRes.data.course);
        setIsEnrolled(enrollRes.data.isEnrolled);

        if (enrollRes.data.isEnrolled) {
          const progRes = await api.get(`/api/enrollment/progress/${id}`);
          setProgress(progRes.data);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error('Course not found.');
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEnrollFree = async () => {
    setEnrolling(true);
    try {
      await api.post(`/api/enrollment/enroll/${id}`);
      toast.success('Enrolled successfully! Start learning 🎉');
      setIsEnrolled(true);
      setProgress({ completedLessons: [], percentage: 0, isCompleted: false });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaidEnroll = async () => {
    setEnrolling(true);
    try {
      const { data } = await api.post(`/api/checkout/create-session/${id}`);
      // Redirect to Stripe's hosted checkout page
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not initiate payment. Please try again.');
      setEnrolling(false);
    }
  };

  const levelColors = {
    Beginner: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    Intermediate: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    Advanced: 'text-red-400 border-red-400/30 bg-red-400/10'
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="page-container max-w-7xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left / Main ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden aspect-video">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${course._id}/800/450`; }}
            />
          </div>

          {/* Category & Level */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-medium glass border border-white/10 text-white/70">
              {course.category}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${levelColors[course.level]}`}>
              {course.level}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug safe-text">{course.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 shrink-0" />
              <span className="font-bold">{course.rating.toFixed(1)}</span>
              <span className="text-white/40">({course.enrolledCount.toLocaleString()} students)</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/50">
              <Clock className="w-4 h-4 shrink-0" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1.5 text-white/50">
              <BookOpen className="w-4 h-4 shrink-0" />
              {course.lessons.length} lessons
            </span>
            <span className="text-purple-400 font-semibold">by {course.instructor}</span>
          </div>

          {/* Description */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-3">About this course</h2>
            <p className="text-white/65 leading-relaxed safe-text">{course.description}</p>
          </div>

          {/* Progress (if enrolled) */}
          {isEnrolled && progress && (
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold">Your Progress</h2>
                <span className="text-purple-400 font-bold text-sm">{progress.percentage || 0}%</span>
              </div>
              <ProgressBar percentage={progress.percentage || 0} />
              <p className="text-white/40 text-xs mt-2">
                {progress.completedLessons?.length || 0} of {course.lessons.length} lessons completed
              </p>
            </div>
          )}

          {/* Lesson list */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-white font-bold text-lg">Course Curriculum</h2>
              <p className="text-white/40 text-sm mt-1">{course.lessons.length} lessons · {course.duration} total</p>
            </div>
            <div className="divide-y divide-white/5">
              {course.lessons.map((lesson, i) => {
                const isDone = progress?.completedLessons?.includes(i);
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isEnrolled
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-white/5 text-white/30'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isEnrolled ? (
                        <Play className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDone ? 'text-emerald-400' : 'text-white/80'}`}>
                        {i + 1}. {lesson.title}
                      </p>
                      {lesson.description && (
                        <p className="text-white/35 text-xs mt-0.5 truncate">{lesson.description}</p>
                      )}
                    </div>
                    <span className="text-white/30 text-xs shrink-0 hidden sm:block">{lesson.duration}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Right / Sticky Purchase Card ────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 glass-card rounded-2xl p-6 space-y-5">
            {/* Price */}
            <div className="text-center py-4 border-b border-white/10">
              {course.isFree ? (
                <div>
                  <p className="text-4xl font-black text-emerald-400">FREE</p>
                  <p className="text-white/40 text-sm mt-1">No payment required</p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl font-black gradient-text">${course.price}</p>
                  <p className="text-white/40 text-sm mt-1">One-time payment</p>
                </div>
              )}
            </div>

            {/* Action button */}
            {isEnrolled ? (
              <button
                onClick={() => navigate(`/courses/play/${id}`)}
                className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 shrink-0" />
                <span>{progress?.isCompleted ? 'Review Course' : 'Continue Learning'}</span>
              </button>
            ) : course.isFree ? (
              <button
                onClick={handleEnrollFree}
                disabled={enrolling}
                className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {enrolling ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 shrink-0" />
                    <span>Enroll Free</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handlePaidEnroll}
                  disabled={enrolling}
                  className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {enrolling ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 shrink-0" />
                      <span>Enroll — ${course.price}</span>
                    </>
                  )}
                </button>

                {/* Stripe test hint */}
                <div
                  className="rounded-xl p-3 text-xs text-white/50 leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p className="font-semibold text-white/70 mb-1">Test Payment Info:</p>
                  <p>Card: <code className="text-purple-400">4242 4242 4242 4242</code></p>
                  <p>Expiry: <code className="text-purple-400">any future date</code></p>
                  <p>CVC: <code className="text-purple-400">any 3 digits</code></p>
                </div>
              </>
            )}

            {/* What's included */}
            <div className="space-y-3 pt-2">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">What's included</p>
              {[
                `${course.lessons.length} on-demand video lessons`,
                `${course.duration} of content`,
                'Full lifetime access',
                'Certificate of completion',
                'AI learning assistant access'
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-white/60">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="safe-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
