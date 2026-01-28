'use client';

import { useState, useRef, useEffect } from 'react';
import { Podcast } from '@/types';

interface AudioPlayerProps {
    podcast: Podcast | null;
    isPlaying: boolean;
    onPlayPause: () => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AudioPlayer({
    podcast,
    isPlaying,
    onPlayPause,
    audioRef,
}: AudioPlayerProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => {
            setDuration(audio.duration);
            setError(null); // Clear error when metadata loaded successfully
        };
        const handleError = () => {
            console.error('Audio playback error:', audio.error);
            setError('Failed to load audio. Please ensure the file exists and is a valid MP3.');
            if (isPlaying) onPlayPause(); // Stop playing state if error occurs
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('error', handleError);
        };
    }, [audioRef, podcast, onPlayPause, isPlaying]);

    useEffect(() => {
        // Clear error when switching podcasts
        setError(null);
    }, [podcast]);

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !audioRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * duration;
    };

    const handleSeek = (seconds: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(
            0,
            Math.min(duration, audioRef.current.currentTime + seconds)
        );
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        if (isMuted) {
            audioRef.current.volume = volume || 1;
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    if (!podcast) return null;

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Error Message */}
            {error && (
                <div className="container-custom relative z-10">
                    <div className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-t-lg mx-auto max-w-md text-center animate-fade-in shadow-lg border-x border-t border-red-400/50">
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {/* Gradient backdrop */}
            <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/95 to-transparent pointer-events-none h-24" />

            <div className="relative glass border-t border-purple-500/20 shadow-2xl">
                <div className="container-custom py-4">
                    <div className="flex items-center gap-4">
                        {/* Track Info */}
                        <div className="hidden sm:flex items-center gap-3 shrink-0 w-64">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 shadow-inner">
                                <img
                                    src={podcast.imageUrl || '/default-cover.png'}
                                    alt={podcast.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate">
                                    {podcast.title}
                                </h4>
                                <p className="text-xs text-gray-400 truncate">
                                    Networker Podcast
                                </p>
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex-1 flex flex-col gap-2">
                            {/* Control Buttons */}
                            <div className="flex items-center justify-center gap-4">
                                {/* Rewind 10s */}
                                <button
                                    onClick={() => handleSeek(-10)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                    title="Rewind 10 seconds"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                                    </svg>
                                </button>

                                {/* Play/Pause */}
                                <button
                                    onClick={onPlayPause}
                                    className="w-12 h-12 rounded-full bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                    disabled={!!error}
                                >
                                    {isPlaying ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>

                                {/* Forward 10s */}
                                <button
                                    onClick={() => handleSeek(10)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                    title="Forward 10 seconds"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-10 text-right">
                                    {formatTime(currentTime)}
                                </span>
                                <div
                                    ref={progressRef}
                                    onClick={handleProgressClick}
                                    className="flex-1 h-1.5 bg-gray-700 rounded-full cursor-pointer group"
                                >
                                    <div
                                        className="h-full bg-linear-to-r from-purple-500 to-cyan-500 rounded-full relative group-hover:h-2 transition-all"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 w-10">
                                    {formatTime(duration)}
                                </span>
                            </div>
                        </div>

                        {/* Volume Control */}
                        <div className="hidden md:flex items-center gap-2 shrink-0 w-32">
                            <button
                                onClick={toggleMute}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio ref={audioRef} src={podcast.audioUrl} preload="metadata" />
        </div>
    );
}
