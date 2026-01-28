'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Podcast } from '@/types';

interface PodcastCardProps {
    podcast: Podcast;
    isPlaying: boolean;
    isSelected: boolean;
    onSelect: (podcast: Podcast) => void;
    onPlayPause: () => void;
    cardIndex: number;
}

const PALETTE = [
    { name: 'blue', border: 'border-blue-500/30', accent: 'bg-blue-600', text: 'text-blue-400', glow: 'shadow-blue-glow', tint: 'bg-blue-500/5', active: '!bg-blue-900/60' },
    { name: 'emerald', border: 'border-emerald-500/30', accent: 'bg-emerald-600', text: 'text-emerald-400', glow: 'shadow-emerald-glow', tint: 'bg-emerald-500/5', active: '!bg-emerald-900/60' },
    { name: 'fuchsia', border: 'border-fuchsia-500/30', accent: 'bg-fuchsia-600', text: 'text-fuchsia-400', glow: 'shadow-fuchsia-glow', tint: 'bg-fuchsia-500/5', active: '!bg-fuchsia-900/60' },
    { name: 'amber', border: 'border-amber-500/30', accent: 'bg-amber-600', text: 'text-amber-400', glow: 'shadow-amber-glow', tint: 'bg-amber-500/5', active: '!bg-amber-900/60' },
    { name: 'cyan', border: 'border-cyan-500/30', accent: 'bg-cyan-600', text: 'text-cyan-400', glow: 'shadow-cyan-glow', tint: 'bg-cyan-500/5', active: '!bg-cyan-900/60' }
];

export default function PodcastCard({
    podcast,
    isPlaying,
    isSelected,
    onSelect,
    onPlayPause,
    cardIndex,
}: PodcastCardProps) {
    const color = PALETTE[cardIndex % PALETTE.length];

    const handleClick = () => {
        onSelect(podcast);
        if (!isSelected) {
            setTimeout(() => onPlayPause(), 100);
        }
    };

    return (
        <article
            onClick={handleClick}
            className={`card cursor-pointer group animate-fade-in relative transition-all duration-700 border ${color.border} ${isSelected
                ? `${color.active} ring-2 ring-white/20 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ${color.glow} scale-[1.01]`
                : `${color.tint} hover:bg-zinc-900/40 hover:scale-[1.005] hover:${color.glow}`
                } mx-2 sm:mx-0`}
            style={{ animationDelay: `${(cardIndex % 5) * 0.1}s` }}
        >
            {isSelected && (
                <div className={`absolute top-0 left-0 w-1.5 h-full ${color.accent} rounded-l-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20`} />
            )}

            <div className={`relative z-10 py-4 ${isSelected ? 'pl-6 pr-4 sm:pr-8' : 'px-4 sm:px-6'}`}>
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                    {/* Podcast Cover Image */}
                    <div className="relative shrink-0 mx-auto sm:mx-0">
                        <div
                            className={`w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${isPlaying && isSelected ? `ring-4 ${color.accent}/20` : ''
                                } group-hover:scale-105`}
                        >
                            <Image
                                src={podcast.imageUrl || '/default-cover.png'}
                                alt={podcast.title}
                                width={180}
                                height={180}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {isSelected && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPlayPause();
                                }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                            >
                                <div className={`w-16 h-16 rounded-full ${color.accent} flex items-center justify-center shadow-2xl ring-4 ring-white/10 scale-90 group-hover:scale-100 transition-transform`}>
                                    {isPlaying ? (
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="6" y="4" width="4" height="16" rx="1.5" />
                                            <rect x="14" y="4" width="4" height="16" rx="1.5" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Podcast Info */}
                    <div className="flex-1 min-w-0 py-2">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="space-y-1">
                                <span className={`text-[10px] font-bold ${color.text} uppercase tracking-[0.2em] block`}>
                                    {color.name} session
                                </span>
                                <h3 className={`text-2xl md:text-3xl font-black tracking-tight transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                    {podcast.title}
                                </h3>
                            </div>
                            {isSelected && isPlaying && (
                                <div className="shrink-0 flex items-end gap-1.5 h-6">
                                    <span className={`w-1 ${color.accent} rounded-full animate-wave-sm`} style={{ height: '60%', animationDelay: '0ms' }} />
                                    <span className={`w-1 ${color.accent} rounded-full animate-wave-sm`} style={{ height: '100%', animationDelay: '150ms' }} />
                                    <span className={`w-1 ${color.accent} rounded-full animate-wave-sm`} style={{ height: '40%', animationDelay: '300ms' }} />
                                </div>
                            )}
                        </div>

                        <p className="text-slate-400 text-sm md:text-base leading-relaxed line-clamp-2 mb-8">
                            {podcast.shortDescription}
                        </p>

                        <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-2 bg-white/5 py-2.5 px-5 rounded-xl border border-white/5">
                                <svg className={`w-4 h-4 ${color.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(podcast.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                            {!isSelected && (
                                <span className={`${color.text} group-hover:translate-x-1 transition-transform inline-flex items-center gap-2 uppercase tracking-widest text-[10px]`}>
                                    View Full Brief
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isSelected && podcast.fullDescription && (
                    <div className="mt-14 pt-12 border-t border-white/5 animate-fade-in w-full text-left">
                        <div className="w-full max-w-4xl space-y-6">
                            <div className="space-y-4">
                                <h4 className={`text-[10px] font-black ${color.text} flex items-center gap-4 uppercase tracking-[0.5em]`}>
                                    <div className={`w-12 h-px ${color.accent} opacity-40`} />
                                    Detailed Briefing
                                </h4>
                                <p className="text-slate-200 text-base md:text-xl leading-relaxed font-medium opacity-90">
                                    {podcast.fullDescription}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
