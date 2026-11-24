import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Headphones,
  TrendingUp,
  Mic2,
  Disc3,
  Radio,
  BarChart3,
  LayoutDashboard,
  Layers,
  Search,
  ShieldCheck,
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// Safe contextual auth hook to extract visitor state without altering global context modules
function useAuth() {
  return useContext(AuthContext) || {};
}

/**
 * About Audiora Page
 *
 * Visitor-friendly, enterprise-grade overview of the Audiora platform.
 * Follows the dark zinc + emerald aesthetic (bg-zinc-950, bg-zinc-900/75, border-zinc-800/80, emerald-500).
 * Highly responsive across mobile (<640px), tablet (640px–1024px), and desktop viewports.
 * Jargon-free copy focused on core product capabilities for both Listeners and Creators.
 */
export default function About() {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative min-h-screen py-4 sm:py-6 pb-28 max-w-7xl mx-auto">
      {/* Ambient Top Glow for Visual Depth matching Home and Search */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-4 h-72 bg-gradient-to-b from-emerald-500/15 via-emerald-950/10 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-8 sm:space-y-10 lg:space-y-12">
        {/* =========================================================================
          SECTION 1: ENTERPRISE HERO BANNER (CINEMATIC FULL-BLEED BACKGROUND)
      ========================================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-[#090e0d] p-6 sm:p-10 lg:p-14 shadow-2xl shadow-black/40">
          {/* Full-bleed atmospheric background image (/about_hero.png) */}
          {!imageError && (
            <img
              src="/about-hero.png"
              alt="Audiora music streaming atmosphere"
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-cover object-[75%_center] sm:object-right md:object-right lg:object-[80%_center] opacity-65 sm:opacity-75 lg:opacity-90 transition-opacity duration-300 pointer-events-none select-none"
            />
          )}

          {/* Horizontal gradient readability mask: deep black behind text on left, transparent on right so headphones & soundwaves glow */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#090e0d] via-[#090e0d]/90 sm:via-[#090e0d]/75 lg:via-[#090e0d]/50 to-transparent pointer-events-none select-none"
            aria-hidden="true"
          />

          {/* Top & bottom subtle fade mask */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#090e0d] via-transparent to-[#090e0d]/30 pointer-events-none select-none"
            aria-hidden="true"
          />

          {/* Mobile-focused gradient overlay for crisp text readability */}
          <div
            className="sm:hidden absolute inset-0 bg-gradient-to-b from-[#090e0d]/80 via-transparent to-[#090e0d]/80 pointer-events-none select-none"
            aria-hidden="true"
          />

          {/* Single-Column Foreground Content */}
          <div className="relative z-10 max-w-2xl lg:max-w-xl xl:max-w-2xl flex flex-col items-start space-y-4 sm:space-y-5 text-left pointer-events-auto">
            {/* Emerald Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <Sparkles size={13} />
              <span>ABOUT AUDIORA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Stream Music Effortlessly.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Publish Your Sound Independently.
              </span>
            </h1>

            {/* Overview Description */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              Audiora brings listeners and independent artists together on one seamless platform designed for uninterrupted audio playback and creative freedom. Whether discovering fresh sounds or releasing your own original work, experience a complete music ecosystem built with clarity and purpose.
            </p>

            {/* Call-to-Actions (CTA) */}
            <div className="flex flex-row items-center gap-2 sm:gap-3.5 w-full sm:w-auto pt-1">
              {/* Primary Emerald Button */}
              <Link
                to="/"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer"
              >
                <Play size={14} className="fill-current shrink-0 sm:w-4 sm:h-4" />
                <span>Explore Music</span>
              </Link>

              {/* Secondary Dark Button tailored to visitor state */}
              {user?.role === 'artist' ? (
                <Link
                  to="/studio"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-100 font-semibold text-xs sm:text-sm whitespace-nowrap border border-zinc-700/70 hover:border-zinc-600 transition-all cursor-pointer"
                >
                  <Mic2 size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
                  <span>
                    <span className="hidden sm:inline">Open </span>Artist Studio
                  </span>
                </Link>
              ) : user?.role === 'user' ? (
                <Link
                  to="/"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-100 font-semibold text-xs sm:text-sm whitespace-nowrap border border-zinc-700/70 hover:border-zinc-600 transition-all cursor-pointer"
                >
                  <TrendingUp size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
                  <span>Browse Trending</span>
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800/90 hover:bg-zinc-800 text-zinc-100 font-semibold text-xs sm:text-sm whitespace-nowrap border border-zinc-700/70 hover:border-zinc-600 transition-all cursor-pointer"
                >
                  <ArrowRight size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
                  <span>Get Started Free</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
          SECTION 2: PLATFORM PILLARS (4-COLUMN STRIP)
      ========================================================================== */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Pillar 1: Non-Stop Playback */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 hover:border-emerald-500/30 transition-all group">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                <Headphones size={18} className="sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5">Non-Stop Playback</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Listen seamlessly while browsing pages with a persistent bottom player.
              </p>
            </div>

            {/* Pillar 2: Live Trending Charts */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 hover:border-emerald-500/30 transition-all group">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp size={18} className="sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5">Live Trending Charts</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Rankings powered directly by real listener plays across the platform.
              </p>
            </div>

            {/* Pillar 3: Creator Studio */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 hover:border-emerald-500/30 transition-all group">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                <Mic2 size={18} className="sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5">Creator Studio</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                A dedicated workspace for artists to upload, organize, and manage releases.
              </p>
            </div>

            {/* Pillar 4: Curated Albums */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 hover:border-emerald-500/30 transition-all group">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                <Disc3 size={18} className="sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5">Curated Albums</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Discover complete artist albums alongside individual music releases.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
          SECTION 3: BUILT FOR TWO WORLDS (FOR LISTENERS VS. FOR ARTISTS)
      ========================================================================== */}
        <section className="space-y-5 sm:space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <span>UNIFIED PLATFORM</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Built for Two Worlds
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-lg mx-auto">
              A cohesive environment designed to serve everyday music enthusiasts and serious music creators with equal precision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Card 1: For Listeners */}
            <div className="rounded-2xl sm:rounded-3xl bg-zinc-900/75 border border-zinc-800/80 p-5 sm:p-7 md:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Headphones size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">For Listeners</h3>
                      <p className="text-xs text-emerald-400 font-medium">Fluid & Immersive Experience</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700/60">
                    Streaming
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5 sm:mb-6">
                  Explore an extensive collection of independent sounds with an audio engine built to stay active wherever you navigate.
                </p>

                <ul className="space-y-3 sm:space-y-3.5 mb-6 sm:mb-8">
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <span>Instant access to trending releases and full albums</span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <span>Fast search by title or artist</span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <span>Full queue and seek controls</span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <span>Zero clutter</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 sm:pt-5 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Jump right into the music catalog</span>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Start Listening</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card 2: For Artists & Creators */}
            <div className="rounded-2xl sm:rounded-3xl bg-zinc-900/75 border border-zinc-800/80 p-5 sm:p-7 md:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Mic2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">For Artists & Creators</h3>
                      <p className="text-xs text-emerald-400 font-medium">Independent Publishing Hub</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 rounded-lg border border-emerald-500/30">
                    Studio Tools
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5 sm:mb-6">
                  Retain full artistic ownership and publish your releases directly to listeners with straightforward catalog management.
                </p>

                <ul className="space-y-3 sm:space-y-3.5 mb-6 sm:mb-8">
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <span>Upload music with custom cover artwork</span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <span>Group releases into albums</span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <span>Monitor live stream counts on every release</span>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <span>Update catalog details anytime</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 sm:pt-5 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Unlock dedicated artist tools</span>
                <Link
                  to={user?.role === 'artist' ? '/studio' : '/register'}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>{user?.role === 'artist' ? 'Go to Studio' : 'Register as Artist'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
          SECTION 4: WHAT MAKES AUDIORA DIFFERENT (6-CARD FEATURE GRID)
      ========================================================================== */}
        <section className="space-y-5 sm:space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span>CORE CAPABILITIES</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              What Makes Audiora Different
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-lg mx-auto">
              Engineered from the ground up to deliver seamless music playback and authentic creator empowerment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Card 1: Persistent Audio & Queue Engine */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 md:p-6 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                  <Radio size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5 sm:mb-2">
                  Persistent Audio & Queue Engine
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Switch between Home, Search, and Albums without interrupting your current song.
                </p>
              </div>
            </div>

            {/* Card 2: Transparent Stream Counting */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 md:p-6 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                  <BarChart3 size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5 sm:mb-2">
                  Transparent Stream Counting
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Every genuine play updates live stream metrics and shapes the Trending chart.
                </p>
              </div>
            </div>

            {/* Card 3: Artist Studio Dashboard */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 md:p-6 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                  <LayoutDashboard size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5 sm:mb-2">
                  Artist Studio Dashboard
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  View total streams, top-performing releases, and catalog details in one workspace.
                </p>
              </div>
            </div>

            {/* Card 4: Flexible Release Formats */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 md:p-6 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                  <Layers size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5 sm:mb-2">
                  Flexible Release Formats
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Publish standalone singles or structure multiple musics into cohesive albums.
                </p>
              </div>
            </div>

            {/* Card 5: Instant Discovery & Search */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 md:p-6 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                  <Search size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5 sm:mb-2">
                  Instant Discovery & Search
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Find specific music, albums, or artists in seconds from anywhere in the app.
                </p>
              </div>
            </div>

            {/* Card 6: Dedicated Role Workspaces */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/80 p-4 sm:p-5 md:p-6 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base mb-1.5 sm:mb-2">
                  Dedicated Role Workspaces
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Purpose-built interfaces tailored separately for everyday listening and creator management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
          SECTION 5: HOW AUDIORA WORKS (3 SIMPLE STEPS)
      ========================================================================== */}
        <section className="space-y-6 sm:space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <Sparkles size={13} className="shrink-0" />
              <span>GETTING STARTED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              How Audiora Works
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Three straightforward steps to explore new sounds or release your independent music catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
            {/* Step 1: Choose Your Account */}
            <div className="relative rounded-3xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-emerald-500/40 p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 hover:-translate-y-1 group flex flex-col justify-between overflow-hidden ring-1 ring-white/[0.02]">
              {/* Ambient Corner Glow */}
              <div
                className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none"
                aria-hidden="true"
              />
              {/* Watermark Step Number */}
              <span
                className="absolute top-3 right-5 text-6xl sm:text-7xl font-black text-white/[0.03] group-hover:text-emerald-400/[0.08] transition-colors font-mono pointer-events-none select-none"
                aria-hidden="true"
              >
                01
              </span>

              <div>
                {/* Header: Icon + Step Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-inner group-hover:scale-105 group-hover:border-emerald-500/50 transition-all duration-300">
                    <UserCheck size={22} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold tracking-wider">
                    STEP 01
                  </span>
                </div>

                {/* Step Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mt-5 mb-2 tracking-tight">
                  Choose Your Account
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Join as a Listener to stream right away, or register as an Artist to unlock Studio tools and upload original music.
                </p>
              </div>

              {/* Bottom Highlight Tag */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Listener or Artist profiles</span>
              </div>
            </div>

            {/* Step 2: Discover or Publish */}
            <div className="relative rounded-3xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-emerald-500/40 p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 hover:-translate-y-1 group flex flex-col justify-between overflow-hidden ring-1 ring-white/[0.02]">
              {/* Ambient Corner Glow */}
              <div
                className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none"
                aria-hidden="true"
              />
              {/* Watermark Step Number */}
              <span
                className="absolute top-3 right-5 text-6xl sm:text-7xl font-black text-white/[0.03] group-hover:text-emerald-400/[0.08] transition-colors font-mono pointer-events-none select-none"
                aria-hidden="true"
              >
                02
              </span>

              <div>
                {/* Header: Icon + Step Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-inner group-hover:scale-105 group-hover:border-emerald-500/50 transition-all duration-300">
                    <Radio size={22} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold tracking-wider">
                    STEP 02
                  </span>
                </div>

                {/* Step Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mt-5 mb-2 tracking-tight">
                  Discover or Publish
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Explore trending music and albums with search, or publish singles and full albums with high-res cover art in minutes.
                </p>
              </div>

              {/* Bottom Highlight Tag */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Full audio streaming & studio uploads</span>
              </div>
            </div>

            {/* Step 3: Listen & Grow */}
            <div className="relative rounded-3xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-emerald-500/40 p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 hover:-translate-y-1 group flex flex-col justify-between overflow-hidden ring-1 ring-white/[0.02]">
              {/* Ambient Corner Glow */}
              <div
                className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none"
                aria-hidden="true"
              />
              {/* Watermark Step Number */}
              <span
                className="absolute top-3 right-5 text-6xl sm:text-7xl font-black text-white/[0.03] group-hover:text-emerald-400/[0.08] transition-colors font-mono pointer-events-none select-none"
                aria-hidden="true"
              >
                03
              </span>

              <div>
                {/* Header: Icon + Step Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-inner group-hover:scale-105 group-hover:border-emerald-500/50 transition-all duration-300">
                    <TrendingUp size={22} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold tracking-wider">
                    STEP 03
                  </span>
                </div>

                {/* Step Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mt-5 mb-2 tracking-tight">
                  Listen & Grow
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Enjoy seamless background playback while browsing. Every listen counts toward live stream totals and powers the Trending charts.
                </p>
              </div>

              {/* Bottom Highlight Tag */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Real-time plays & chart ranking</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
          SECTION 6: CLOSING CALL-TO-ACTION BANNER
      ========================================================================== */}
        <section className="rounded-2xl bg-zinc-900/90 border border-emerald-500/25 p-5 sm:p-7 md:p-8 flex flex-col md:flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 shadow-xl shadow-black/20">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
              Ready to experience Audiora?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Start streaming right away or join our creator community to share your sound with listeners everywhere.
            </p>
          </div>

          <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <Link
              to="/"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer"
            >
              <Play size={14} className="fill-current shrink-0 sm:w-4 sm:h-4" />
              <span>Explore Music</span>
            </Link>

            {user?.role === 'artist' ? (
              <Link
                to="/studio"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-xs sm:text-sm whitespace-nowrap border border-zinc-700/60 hover:border-zinc-600 transition-all cursor-pointer"
              >
                <Mic2 size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
                <span>Artist Studio</span>
              </Link>
            ) : user?.role === 'user' ? (
              <Link
                to="/"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-xs sm:text-sm whitespace-nowrap border border-zinc-700/60 hover:border-zinc-600 transition-all cursor-pointer"
              >
                <TrendingUp size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
                <span>Browse Trending</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-xs sm:text-sm whitespace-nowrap border border-zinc-700/60 hover:border-zinc-600 transition-all cursor-pointer"
              >
                <ArrowRight size={14} className="text-emerald-400 shrink-0 sm:w-4 sm:h-4" />
                <span>Get Started Free</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
