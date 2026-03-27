import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg animate-fade-up">
        {/* Giant 404 */}
        <div className="relative inline-block mb-6">
          <p className="font-display font-black text-[160px] leading-none
                        text-gradient-violet select-none opacity-25">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl animate-float">🌌</span>
          </div>
        </div>

        <h1 className="font-display font-extrabold text-3xl text-white mb-3">
          Lost in Space
        </h1>
        <p className="font-body text-base mb-10 max-w-sm mx-auto"
           style={{ color: 'var(--text-muted)' }}>
          This page has drifted into the void. Let's get you back to something real.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/"       className="btn btn-primary btn-lg">← Back to Home</Link>
          <Link to="/courses" className="btn btn-outline btn-lg">Browse Courses</Link>
        </div>
      </div>
    </main>
  )
}