export default function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden h-full flex flex-col">
      <div className="skeleton aspect-video" />
      <div className="p-5 space-y-3 flex-1">
        <div className="flex justify-between">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="mt-auto pt-3 border-t border-white/6 flex justify-between">
          <div className="skeleton h-4 w-24 rounded-full" />
          <div className="skeleton h-4 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}