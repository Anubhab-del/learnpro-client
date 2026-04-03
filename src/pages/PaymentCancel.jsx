import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="page-container flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="glass-card rounded-3xl p-10 text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-orange-400" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white mb-2">Payment Cancelled</h1>
            <p className="text-white/50 text-sm">
              No worries — your card was not charged. You can try again whenever you're ready.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.history.back()}
              className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" />
              <span>Try Again</span>
            </button>

            <Link
              to="/dashboard"
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 glass border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Browse Free Courses</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
