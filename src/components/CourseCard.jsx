import { Link } from 'react-router-dom';
import { Star, Clock, Users, BookOpen, ChevronRight } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function CourseCard({ course, progress, isEnrolled }) {
  const {
    _id,
    title,
    description,
    instructor,
    category,
    level,
    duration,
    thumbnail,
    price,
    isFree,
    rating,
    enrolledCount,
    lessons = []
  } = course;

  const levelColors = {
    Beginner: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Advanced: 'text-red-400 bg-red-400/10 border-red-400/20'
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden shrink-0">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${_id}/640/360`;
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          {isFree ? (
            <span className="badge badge-free">FREE</span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
              ${price}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-black/50 backdrop-blur-sm text-white/90 border border-white/20">
            {category}
          </span>
        </div>

        {/* Enrolled badge */}
        {isEnrolled && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-600/80 backdrop-blur-sm text-white">
              Enrolled
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Level badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge border text-xs ${levelColors[level] || levelColors.Beginner}`}>
            {level}
          </span>
          <span className="flex items-center gap-1 text-white/50 text-xs">
            <BookOpen className="w-3 h-3 shrink-0" />
            {lessons.length} lessons
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-base leading-snug line-clamp-2 safe-text">
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/55 text-sm leading-relaxed line-clamp-2 safe-text flex-1">
          {description}
        </p>

        {/* Instructor */}
        <p className="text-purple-400 text-sm font-medium truncate">
          by {instructor}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-white/70">{rating.toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 shrink-0" />
            {enrolledCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            {duration}
          </span>
        </div>

        {/* Progress bar (if enrolled) */}
        {isEnrolled && progress !== undefined && (
          <div className="mt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/50">Progress</span>
              <span className="text-xs font-semibold text-purple-400">
                {progress.percentage || 0}%
              </span>
            </div>
            <ProgressBar percentage={progress.percentage || 0} />
          </div>
        )}

        {/* Action button */}
        <Link
          to={`/courses/${_id}`}
          className="mt-auto btn-primary w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <span>
            {isEnrolled
              ? progress?.isCompleted
                ? 'Review Course'
                : 'Continue Learning'
              : 'View Details'}
          </span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
