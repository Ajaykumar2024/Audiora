export default function ComingSoon({
    title,
    description = "We're crafting this experience for you. Stay tuned.",
}) {
    return (
        <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
            <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-slate-900/90 border border-emerald-500/25 px-6 py-14 sm:px-12 sm:py-16 text-center shadow-2xl shadow-emerald-950/40">
                {/* Subtle ambient emerald glow */}
                <div
                    className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full bg-emerald-500/15 blur-3xl"
                    aria-hidden="true"
                />


                {/* Page Context Label */}
                {title && (
                    <p className="relative text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-2">
                        {title}
                    </p>
                )}

                {/* Large Primary Heading */}
                <h1 className="relative text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Coming <span className="text-emerald-400">Soon</span>
                </h1>

                {/* Short One-Line Subtext */}
                {description && (
                    <p className="relative mx-auto mt-4 max-w-md text-sm sm:text-base text-slate-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}