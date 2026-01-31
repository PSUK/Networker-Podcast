export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/5 mt-auto bg-black/20">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <svg
                                className="w-5 h-5 text-white"
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
                        <span className="text-slate-400 font-bold tracking-tight">
                            NETWORKER PODCAST
                        </span>
                    </div>

                    <p className="text-slate-500 text-sm font-medium text-center md:text-left">
                        © {new Date().getFullYear()} Networker Podcast. <br className="md:hidden" />Stay Safe. Stay Connected.
                    </p>

                    <div className="flex items-center gap-6 text-xs font-bold text-slate-600 uppercase tracking-widest">
                        <span className="hover:text-purple-400 transition-colors cursor-default">Telecom</span>
                        <span className="hover:text-purple-400 transition-colors cursor-default">Safety</span>
                        <span className="hover:text-purple-400 transition-colors cursor-default">Standards</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
