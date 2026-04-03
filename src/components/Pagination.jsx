import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis logic
  const getPages = () => {
    const pages = [];
    const delta = 1; // pages on each side of current

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    if (left > 2) pages.push('...');

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  const btnBase =
    'flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-200 select-none';

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap mt-8">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} gap-1 px-3 ${
          currentPage === 1
            ? 'text-white/25 cursor-not-allowed'
            : 'glass text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex items-center justify-center w-9 h-9 text-white/30 text-sm select-none"
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${btnBase} ${
              page === currentPage
                ? 'text-white font-bold border border-purple-500/50 shadow-lg'
                : 'glass text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
            style={
              page === currentPage
                ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(219,39,119,0.3))' }
                : {}
            }
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} gap-1 px-3 ${
          currentPage === totalPages
            ? 'text-white/25 cursor-not-allowed'
            : 'glass text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
        }`}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </button>

      {/* Page indicator */}
      <span className="text-white/30 text-xs ml-2 hidden sm:block">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}
