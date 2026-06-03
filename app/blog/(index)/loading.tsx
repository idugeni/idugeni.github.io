export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-12 animate-pulse">
            <div className="h-10 w-48 bg-zinc-800 rounded mb-4"></div>
            <div className="h-6 w-96 bg-zinc-900 rounded"></div>
          </div>
          
          {/* Filter skeleton */}
          <div className="flex gap-4 mb-8 animate-pulse">
            <div className="h-10 w-32 bg-zinc-800 rounded"></div>
            <div className="h-10 w-32 bg-zinc-800 rounded"></div>
            <div className="h-10 w-32 bg-zinc-800 rounded"></div>
          </div>
          
          {/* Article cards skeleton */}
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 animate-pulse">
                <div className="flex gap-6">
                  <div className="w-48 h-32 bg-zinc-800 rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-6 w-3/4 bg-zinc-800 rounded mb-3"></div>
                    <div className="h-4 w-full bg-zinc-900 rounded mb-2"></div>
                    <div className="h-4 w-5/6 bg-zinc-900 rounded mb-4"></div>
                    <div className="flex gap-4">
                      <div className="h-3 w-20 bg-zinc-800 rounded"></div>
                      <div className="h-3 w-24 bg-zinc-800 rounded"></div>
                    </div>
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
              <span className="ml-2">LOADING_ARTICLES...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
