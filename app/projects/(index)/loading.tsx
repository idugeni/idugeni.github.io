export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-12 animate-pulse">
            <div className="h-10 w-56 bg-zinc-800 rounded mb-4"></div>
            <div className="h-6 w-full max-w-2xl bg-zinc-900 rounded"></div>
          </div>
          
          {/* Filter skeleton */}
          <div className="flex gap-4 mb-8 animate-pulse">
            <div className="h-10 w-28 bg-zinc-800 rounded"></div>
            <div className="h-10 w-28 bg-zinc-800 rounded"></div>
            <div className="h-10 w-28 bg-zinc-800 rounded"></div>
            <div className="h-10 w-28 bg-zinc-800 rounded"></div>
          </div>
          
          {/* Project grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-zinc-800"></div>
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-zinc-800 rounded mb-3"></div>
                  <div className="h-4 w-full bg-zinc-900 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-zinc-900 rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-zinc-800 rounded-full"></div>
                    <div className="h-6 w-20 bg-zinc-800 rounded-full"></div>
                    <div className="h-6 w-14 bg-zinc-800 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                    <div className="h-8 w-24 bg-zinc-800 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Loading indicator */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-green-400 font-mono text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="ml-2">LOADING_PROJECTS...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
