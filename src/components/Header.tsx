'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 py-1'
                : 'bg-transparent py-3'
                }`}
        >
            <div className="container-custom">
                <div className="flex items-center justify-between h-16 md:h-20">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="relative">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 ring-4 ring-purple-500/0 group-hover:ring-purple-500/20">
                                <svg
                                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                </svg>
                            </div>
                            <div className="absolute -inset-2 bg-linear-to-r from-purple-600 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                        </div>
                        <div className="hidden xs:block">
                            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                                NETWORKER<span className="text-purple-500 italic">PODCAST</span>
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Security & Infrastructure</p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-1 md:gap-4 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
                        <Link
                            href="/"
                            className="px-4 md:px-6 py-2 rounded-xl text-slate-300 hover:text-white transition-all text-sm font-bold hover:bg-white/5"
                        >
                            Explore
                        </Link>
                        <Link
                            href="/admin"
                            className="px-4 md:px-6 py-2 rounded-xl bg-linear-to-br from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/20 hover:from-purple-600 hover:to-indigo-600 hover:text-white transition-all text-sm font-bold shadow-2xl"
                        >
                            Dashboard
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
