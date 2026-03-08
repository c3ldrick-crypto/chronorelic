export default function GameLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[#1e1e42] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-[#1e1e42] rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-[#1e1e42] rounded-2xl" />
      </div>
    </div>
  )
}
