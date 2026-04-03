import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, Star, Zap, ChevronRight, Code2, Brain, Shield,
  Database, Cloud, Smartphone, Palette, Cpu, ArrowRight, Play
} from 'lucide-react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';

const CATEGORIES = [
  { name: 'Web Development', icon: Code2, color: 'from-blue-500 to-cyan-500', courses: 9 },
  { name: 'Data Science', icon: Brain, color: 'from-purple-500 to-violet-500', courses: 5 },
  { name: 'Artificial Intelligence', icon: Cpu, color: 'from-pink-500 to-rose-500', courses: 5 },
  { name: 'Mobile Development', icon: Smartphone, color: 'from-green-500 to-emerald-500', courses: 5 },
  { name: 'Cloud & DevOps', icon: Cloud, color: 'from-sky-500 to-blue-500', courses: 5 },
  { name: 'Cybersecurity', icon: Shield, color: 'from-red-500 to-orange-500', courses: 4 },
  { name: 'Database', icon: Database, color: 'from-amber-500 to-yellow-500', courses: 3 },
  { name: 'UI/UX Design', icon: Palette, color: 'from-fuchsia-500 to-pink-500', courses: 3 }
];

const STATS = [
  { label: 'Total Courses', value: '42+', icon: BookOpen },
  { label: 'Active Students', value: '50K+', icon: Users },
  { label: 'Avg Rating', value: '4.7★', icon: Star },
  { label: 'Expert Instructors', value: '12+', icon: Zap }
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api.get('/api/courses/featured/list')
      .then(({ data }) => setFeatured(data.courses || []))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));
  }, []);

  return (
    <div className="page-container">

      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Glow orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'float 8s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(219,39,119,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'float 10s ease-in-out infinite reverse'
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-white/80 text-sm font-medium">42+ Production-Level Courses Available</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 animate-slide-up safe-text"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-white">Master Your</span>
            <br />
            <span className="gradient-text">Future.</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up safe-text"
            style={{ animationDelay: '0.2s' }}
          >
            Learn from industry experts. Build real projects. Track your progress. Get AI-powered guidance — all in one beautiful platform.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              to="/register"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold shadow-2xl"
            >
              <Zap className="w-5 h-5 shrink-0" />
              <span>Start Learning Free</span>
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold glass border border-white/20 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <Play className="w-5 h-5 shrink-0" />
              <span>Browse Courses</span>
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-white/30 text-sm mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            No credit card required · Join 50,000+ learners
          </p>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black gradient-text mb-1">{value}</p>
              <p className="text-white/50 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Explore by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            From web development to AI — find the exact skill set your career needs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORIES.map(({ name, icon: Icon, color, courses }) => (
            <Link
              key={name}
              to={`/dashboard?category=${encodeURIComponent(name)}`}
              className="glass-card rounded-2xl p-5 text-center group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-semibold text-sm leading-snug mb-1 safe-text">{name}</p>
              <p className="text-white/40 text-xs">{courses} courses</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Courses ─────────────────────────────────────────────────── */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Featured <span className="gradient-text">Courses</span>
            </h2>
            <p className="text-white/50">Handpicked by our instructors for maximum impact.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/20 text-white/70 hover:text-white transition-all text-sm font-medium"
          >
            View All <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl aspect-[4/5] shimmer" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/40">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>No featured courses yet. Seed the database to get started.</p>
          </div>
        )}
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <div
          className="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(219,39,119,0.2) 100%)',
            border: '1px solid rgba(168,85,247,0.3)'
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(168,85,247,0.1) 0%, transparent 70%)'
            }}
          />
          <h2 className="relative text-3xl sm:text-5xl font-black text-white mb-4 safe-text">
            Ready to <span className="gradient-text">level up?</span>
          </h2>
          <p className="relative text-white/60 text-lg mb-8 max-w-xl mx-auto safe-text">
            Create your free account in seconds. No credit card, no catch. Just pure learning.
          </p>
          <Link
            to="/register"
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold shadow-2xl relative"
          >
            <span>Create Free Account</span>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">LearnPro</span>
          </div>
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} LearnPro EdTech Platform. Built for learners.
          </p>
        </div>
      </footer>
    </div>
  );
}
