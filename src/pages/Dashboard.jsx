import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckCircle2, Search, SlidersHorizontal,
  X, Loader2, Trophy, BookMarked, Zap
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import Pagination from '../components/Pagination';

const CATEGORIES = [
  'All', 'Web Development', 'Data Science', 'Artificial Intelligence',
  'Mobile Development', 'Cloud & DevOps', 'Cybersecurity',
  'Database', 'UI/UX Design', 'Programming Languages'
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const TABS = [
  { key: 'explore', label: 'Explore', icon: Search },
  { key: 'my-learning', label: 'My Learning', icon: BookMarked },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── Tab state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('explore');

  // ─── Explore state ───────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef(null);

  // ─── My Learning & Completed state ───────────────────────────────────────────
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // ─── Apply URL category param (from Home categories) ─────────────────────────
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setCategory(urlCategory);
      setSearchParams({});
    }
  }, []);

  // ─── Fetch courses with debounce on search ────────────────────────────────────
  const fetchCourses = useCallback(async (page = 1) => {
    setLoadingCourses(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      if (level !== 'All') params.set('level', level);

      const { data } = await api.get(`/api/courses?${params}`);
      setCourses(data.courses || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [search, category, level]);

  useEffect(() => {
    if (activeTab !== 'explore') return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchCourses(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, category, level, activeTab]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCourses(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Fetch enrollments ────────────────────────────────────────────────────────
  const fetchEnrollments = useCallback(async () => {
    setLoadingEnrollments(true);
    try {
      const { data } = await api.get('/api/enrollment/my');
      setEnrollments(data.enrollments || []);
    } catch {
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'my-learning' || activeTab === 'completed') {
      fetchEnrollments();
    }
  }, [activeTab]);

  // ─── Split enrollments ────────────────────────────────────────────────────────
  const inProgress = enrollments.filter((e) => !e.progress?.isCompleted);
  const completed = enrollments.filter((e) => e.progress?.isCompleted);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setLevel('All');
    setCurrentPage(1);
  };
  const hasFilters = search || category !== 'All' || level !== 'All';

  return (
    <div className="page-container px-4 py-8 max-w-7xl mx-auto">

      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-white truncate">
              Hey, <span className="gradient-text">{user?.name || user?.email?.split('@')[0]}</span> 👋
            </h1>
            <p className="text-white/50 text-sm">Keep learning. Keep growing.</p>
          </div>
        </div>
      </div>

      {/* ─── Tab Bar ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 glass rounded-2xl mb-8 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = key === 'my-learning' ? inProgress.length : key === 'completed' ? completed.length : null;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-1 justify-center transition-all duration-200 ${
                activeTab === key
                  ? 'text-white shadow-lg'
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={
                activeTab === key
                  ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(219,39,119,0.4))' }
                  : {}
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {count !== null && count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/20">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          EXPLORE TAB
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'explore' && (
        <div>
          {/* Search + filter bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses by title..."
                className="cosmic-input w-full pl-10 pr-10 py-3 rounded-xl text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                showFilters || hasFilters
                  ? 'text-purple-300 border border-purple-500/40 bg-purple-500/10'
                  : 'glass border border-white/10 text-white/70 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Filters</span>
              {hasFilters && <span className="w-2 h-2 rounded-full bg-purple-400" />}
            </button>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white glass border border-white/10 transition-all"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
                Clear
              </button>
            )}
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="glass-card rounded-2xl p-5 mb-6 animate-fade-in">
              <div className="flex flex-wrap gap-6">
                {/* Category */}
                <div className="flex-1 min-w-[200px]">
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                          category === cat
                            ? 'text-white border border-purple-500/50'
                            : 'glass border border-white/10 text-white/60 hover:text-white'
                        }`}
                        style={category === cat ? { background: 'rgba(124,58,237,0.4)' } : {}}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="min-w-[160px]">
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Level</p>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((lv) => (
                      <button
                        key={lv}
                        onClick={() => setLevel(lv)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          level === lv
                            ? 'text-white border border-purple-500/50'
                            : 'glass border border-white/10 text-white/60 hover:text-white'
                        }`}
                        style={level === lv ? { background: 'rgba(124,58,237,0.4)' } : {}}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          {!loadingCourses && (
            <p className="text-white/40 text-sm mb-5">
              {pagination.total} course{pagination.total !== 1 ? 's' : ''} found
              {search && <span> for "<span className="text-purple-400">{search}</span>"</span>}
              {category !== 'All' && <span> in <span className="text-purple-400">{category}</span></span>}
            </p>
          )}

          {/* Course grid */}
          {loadingCourses ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl aspect-[4/5] shimmer" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-14 h-14 mx-auto mb-4 text-white/20" />
              <p className="text-white/50 text-lg font-medium mb-2">No courses found</p>
              <p className="text-white/30 text-sm">Try a different search term or filters</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 text-purple-400 hover:text-purple-300 text-sm underline">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MY LEARNING TAB
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'my-learning' && (
        <div>
          {loadingEnrollments ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="glass-card rounded-2xl aspect-[4/5] shimmer" />)}
            </div>
          ) : inProgress.length === 0 ? (
            <div className="text-center py-20">
              <BookMarked className="w-14 h-14 mx-auto mb-4 text-white/20" />
              <p className="text-white/50 text-lg font-medium mb-2">No courses in progress</p>
              <p className="text-white/30 text-sm mb-6">Explore our catalog and enroll in your first course!</p>
              <button
                onClick={() => setActiveTab('explore')}
                className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                <Zap className="w-4 h-4 shrink-0" />
                Browse Courses
              </button>
            </div>
          ) : (
            <>
              <p className="text-white/40 text-sm mb-5">
                {inProgress.length} course{inProgress.length !== 1 ? 's' : ''} in progress
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inProgress.map(({ course, progress }) => (
                  <CourseCard key={course._id} course={course} progress={progress} isEnrolled />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          COMPLETED TAB
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'completed' && (
        <div>
          {loadingEnrollments ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(2)].map((_, i) => <div key={i} className="glass-card rounded-2xl aspect-[4/5] shimmer" />)}
            </div>
          ) : completed.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-14 h-14 mx-auto mb-4 text-white/20" />
              <p className="text-white/50 text-lg font-medium mb-2">No completed courses yet</p>
              <p className="text-white/30 text-sm mb-6">
                Watch all lessons and mark them complete to finish a course!
              </p>
              <button
                onClick={() => setActiveTab('my-learning')}
                className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                <BookMarked className="w-4 h-4 shrink-0" />
                Continue Learning
              </button>
            </div>
          ) : (
            <>
              {/* Celebration header */}
              <div
                className="rounded-2xl p-6 mb-8 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.1) 100%)',
                  border: '1px solid rgba(16,185,129,0.3)'
                }}
              >
                <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <p className="text-white font-bold text-lg">
                  You've completed {completed.length} course{completed.length !== 1 ? 's' : ''}!
                </p>
                <p className="text-white/50 text-sm mt-1">Incredible work. Keep going!</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {completed.map(({ course, progress }) => (
                  <div key={course._id} className="relative">
                    {/* Completion banner */}
                    <div
                      className="absolute -top-2 -right-2 z-10 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                    >
                      ✓ Completed
                    </div>
                    <CourseCard course={course} progress={progress} isEnrolled />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
