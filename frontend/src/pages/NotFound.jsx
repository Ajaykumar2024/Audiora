export default function NotFound() {
  return (
    <main className="-mx-4 sm:-mx-6 -mb-12 sm:-mb-16 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 py-16 pb-24 sm:pb-28 relative overflow-hidden bg-black text-zinc-50">
      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
        {/* Balanced prominent 404 with emerald glow */}
        <div className="relative select-none mb-2">
          <div
            className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none"
            aria-hidden="true"
          />
          <span className="relative text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-600 drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            404
          </span>
        </div>

        {/* Bold heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight mb-3">
          Page Not Found
        </h1>

        {/* Concise description */}
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-md">
          The page or music you're looking for doesn't exist or may have been moved.
        </p>
      </div>
    </main>
  )
}
