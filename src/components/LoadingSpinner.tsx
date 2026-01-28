export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
            </div>
            <p className="mt-4 text-gray-400">Loading podcasts...</p>
        </div>
    );
}
