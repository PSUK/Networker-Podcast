'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function WelcomePage() {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/verify-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                router.push('/');
                router.refresh();
            } else {
                setError('Access Denied');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 animate-fade-in text-center">
                {/* Logo Section */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-32 h-32 md:w-40 md:h-40">
                        <Image
                            src="/default-cover.png"
                            alt="Networker Podcast"
                            fill
                            className="object-cover rounded-2xl drop-shadow-[0_0_25px_rgba(139,92,246,0.3)]"
                            priority
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            Networker Podcast
                        </h1>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
                            Internal Access Only
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Access Password"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-center text-white placeholder-slate-500 transition-all outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 tracking-widest"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm font-bold bg-red-500/10 py-2 rounded-lg animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? 'Verifying...' : 'Enter Podcast'}
                        </button>
                    </div>
                </form>

                <p className="text-xs text-slate-600 opacity-60">
                    &copy; 2026 Networker Podcast. All rights reserved.
                </p>
            </div>
        </main>
    );
}
