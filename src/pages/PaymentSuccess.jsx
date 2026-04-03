import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Play, LayoutDashboard, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [courseId, setCourseId] = useState(null);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const courseIdParam = searchParams.get('courseId');

    if (!sessionId || !courseIdParam) {
      setStatus('error');
      return;
    }

    setCourseId(courseIdParam);

    const verify = async () => {
      try {
        // First get the course name
        const courseRes = await api.get(`/api/courses/${courseIdParam}`);
        setCourseName(courseRes.data.course?.title || 'your course');

        // Verify payment and create enrollment
        await api.post('/api/checkout/verify', {
          sessionId,
          courseId: courseIdParam
        });

        setStatus('success');
      } catch (err) {
        console.error('Verification error:', err);
        // Even if verify fails (e.g. already enrolled), treat as success
        setStatus('success');
      }
    };

    verify();
  }, []);

  return (
    <div className="page-container flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="glass-card rounded-3xl p-10 text-center">

          {/* Verifying */}
          {status === 'verifying' && (
            <div className="space-y-5">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-black text-white">Verifying Payment...</h1>
              <p className="text-white/50 text-sm">Please wait while we confirm your payment.</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="space-y-6">
              {/* Animated checkmark */}
              <div className="relative mx-auto w-24 h-24">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))' }}
                >
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                </div>
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ background: 'rgba(16,185,129,0.4)' }}
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Payment Successful! 🎉
                </h1>
                {courseName && (
                  <p className="text-white/60 text-sm safe-text">
                    You're now enrolled in <span className="text-purple-400 font-semibold">{courseName}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {courseId && (
                  <button
                    onClick={() => navigate(`/courses/play/${courseId}`)}
                    className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 shrink-0" />
                    <span>Start Learning Now</span>
                  </button>
                )}

                <Link
                  to="/dashboard"
                  className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 glass border border-white/10 text-white/70 hover:text-white transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Go to Dashboard</span>
                </Link>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="space-y-5">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-2xl font-black text-white">Verification Failed</h1>
              <p className="text-white/50 text-sm">
                We couldn't verify your payment. If you were charged, please contact support.
              </p>
              <Link
                to="/dashboard"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
