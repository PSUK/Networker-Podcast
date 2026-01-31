'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PodcastCard from '@/components/PodcastCard';
import AudioPlayer from '@/components/AudioPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Podcast } from '@/types';

export default function HomePage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/api/podcasts');
      if (!response.ok) throw new Error('Failed to fetch podcasts');
      const data = await response.json();
      setPodcasts(data);
    } catch (err) {
      setError('Failed to load podcasts. Please try again later.');
      console.error('Error fetching podcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPodcast = (podcast: Podcast) => {
    if (selectedPodcast?.id !== podcast.id) {
      setSelectedPodcast(podcast);
      setIsPlaying(false);
      // Load new audio source
      if (audioRef.current) {
        audioRef.current.src = podcast.audioUrl;
        audioRef.current.load();
      }
    }
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !selectedPodcast) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  // Listen for audio end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => audio.removeEventListener('ended', handleEnded);
  }, [selectedPodcast]);

  return (
    <>
      <Header />

      <main className="flex-1 pb-32">
        {/* Dynamic Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-grid">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container-custom relative z-10">
          {/* Hero Section */}
          <section className="pt-40 pb-20 md:pt-52 md:pb-40 text-center mx-auto animate-fade-in">
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-[10px] md:text-xs font-black text-purple-500/80 uppercase tracking-[0.6em] block">
                  Secure Infrastructure Intelligence
                </span>
                <div className="relative inline-block pb-2 px-4">
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-1">
                    NETWORKER<br />
                    <span className="gradient-text italic block py-1 uppercase tracking-tight">PODCAST</span>
                  </h1>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-sm md:text-xl text-slate-400 font-medium leading-relaxed max-w-4xl mx-auto px-6 opacity-90 mb-0">
                  Strategic insights on <span className="text-slate-200">telecommunications</span>,
                  workplace <span className="text-slate-200">safety</span>, and UK industry
                  regulations.
                </p>

                {/* Visual Spacer 16px */}
                <div className="w-full h-4" />
              </div>
            </div>
          </section>

          {/* Podcasts Grid */}
          <section className="pt-[15vh] border-t border-white/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-20 mb-[15vh] px-10">
              <div className="space-y-8 py-8">
                <h2 className="text-xs md:text-sm font-black text-white/60 tracking-[0.6em] uppercase">Latest Episodes</h2>
                {/* Deployment Force: 2026-01-29 */}
                <div className="w-8 h-px bg-purple-600 opacity-30" />
              </div>
              <div className="flex items-center gap-6 bg-white/5 px-10 py-5 rounded-4xl border border-white/5 shadow-2xl mb-8">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                  {podcasts.length} Briefs
                </span>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-center py-20 card bg-rose-500/5 border-rose-500/10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-rose-500/20 flex items-center justify-center border border-rose-500/20">
                  <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-rose-400 font-bold uppercase tracking-widest text-sm">{error}</p>
                <button onClick={fetchPodcasts} className="mt-8 btn btn-primary px-10 py-4 font-black uppercase tracking-widest text-xs">
                  Reload System
                </button>
              </div>
            ) : podcasts.length === 0 ? (
              <div className="text-center py-32 card bg-slate-900/20 border-white/5">
                <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-2xl">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                  No Active Intel
                </h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  The briefing room is currently clear. New strategic updates scheduled shortly.
                </p>
              </div>
            ) : (
              <div className="grid gap-12 md:gap-16">
                {podcasts.map((podcast, index) => (
                  <PodcastCard
                    key={podcast.id}
                    podcast={podcast}
                    isPlaying={isPlaying && selectedPodcast?.id === podcast.id}
                    isSelected={selectedPodcast?.id === podcast.id}
                    onSelect={handleSelectPodcast}
                    onPlayPause={handlePlayPause}
                    cardIndex={index}
                  />
                ))}
              </div>
            )}

            {/* Force bottom spacing for footer separation */}
            <div className="h-32 w-full" />
          </section>
        </div>
      </main>

      <Footer />

      {/* Audio Player */}
      {selectedPodcast && (
        <AudioPlayer
          podcast={selectedPodcast}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          audioRef={audioRef}
        />
      )}
    </>
  );
}
