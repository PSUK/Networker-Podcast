'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Podcast } from '@/types';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [fullDescription, setFullDescription] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const audioInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/admin/verify');
            const data = await response.json();

            if (data.authenticated) {
                setIsAuthenticated(true);
                fetchPodcasts();
            } else {
                router.push('/admin');
            }
        } catch (err) {
            router.push('/admin');
        } finally {
            setLoading(false);
        }
    };

    const fetchPodcasts = async () => {
        try {
            const response = await fetch('/api/podcasts');
            const data = await response.json();
            setPodcasts(data);
        } catch (err) {
            console.error('Error fetching podcasts:', err);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!audioFile) {
            setError('Please select an audio file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('shortDescription', shortDescription);
            if (fullDescription) {
                formData.append('fullDescription', fullDescription);
            }
            formData.append('audioFile', audioFile);
            if (imageFile) {
                formData.append('imageFile', imageFile);
            }

            const response = await fetch('/api/admin/podcasts', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploadSuccess(true);
                resetForm();
                fetchPodcasts();
                setTimeout(() => {
                    setShowUploadForm(false);
                    setUploadSuccess(false);
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to upload podcast');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setShortDescription('');
        setFullDescription('');
        setAudioFile(null);
        setImageFile(null);
        setImagePreview(null);
        if (audioInputRef.current) audioInputRef.current.value = '';
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleDeletePodcast = async (id: string) => {
        if (!confirm('Are you sure you want to delete this podcast?')) return;

        try {
            const response = await fetch(`/api/podcasts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchPodcasts();
            }
        } catch (err) {
            console.error('Error deleting podcast:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-purple-500/20">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="hidden sm:inline">Back to Site</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-700" />
                            <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container-custom py-12">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Podcasts</p>
                                <p className="text-2xl font-bold text-white">{podcasts.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Latest Upload</p>
                                <p className="text-lg font-semibold text-white">
                                    {podcasts[0]
                                        ? new Date(podcasts[0].createdAt).toLocaleDateString('en-GB')
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Status</p>
                                <p className="text-lg font-semibold text-green-400">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Podcast Management</h2>
                    <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {showUploadForm ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Upload New Podcast
                            </>
                        )}
                    </button>
                </div>

                {/* Upload Form */}
                {showUploadForm && (
                    <div className="card p-6 mb-8 animate-fade-in">
                        <h3 className="text-lg font-semibold text-white mb-6">Upload New Podcast</h3>

                        {uploadSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-green-400 font-medium">Podcast uploaded successfully!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="input"
                                                placeholder="Enter podcast title"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-300 mb-2">
                                                Short Description *
                                            </label>
                                            <input
                                                type="text"
                                                id="shortDescription"
                                                value={shortDescription}
                                                onChange={(e) => setShortDescription(e.target.value)}
                                                className="input"
                                                placeholder="Brief description for the card"
                                                required
                                                maxLength={200}
                                            />
                                            <p className="text-gray-500 text-xs mt-1">
                                                {shortDescription.length}/200 characters
                                            </p>
                                        </div>

                                        <div>
                                            <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-300 mb-2">
                                                Full Description
                                            </label>
                                            <textarea
                                                id="fullDescription"
                                                value={fullDescription}
                                                onChange={(e) => setFullDescription(e.target.value)}
                                                className="input min-h-32 resize-y"
                                                placeholder="Detailed description shown when expanded (optional)"
                                                rows={4}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Audio File (MP3) *
                                            </label>
                                            <div
                                                onClick={() => audioInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                                            >
                                                <input
                                                    type="file"
                                                    ref={audioInputRef}
                                                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                                    accept="audio/mp3,audio/mpeg"
                                                    className="hidden"
                                                    required
                                                />
                                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                    </svg>
                                                </div>
                                                {audioFile ? (
                                                    <p className="text-purple-400 font-medium">{audioFile.name}</p>
                                                ) : (
                                                    <>
                                                        <p className="text-gray-400">Click to upload MP3 file</p>
                                                        <p className="text-gray-500 text-sm mt-1">Max file size: 100MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Cover Image (Optional)
                                            </label>
                                            <div
                                                onClick={() => imageInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                                            >
                                                <input
                                                    type="file"
                                                    ref={imageInputRef}
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                {imagePreview ? (
                                                    <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700 flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-gray-400">Click to upload image</p>
                                                        <p className="text-gray-500 text-sm mt-1">
                                                            Leave empty to use default cover
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            setShowUploadForm(false);
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="btn btn-primary flex items-center gap-2"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Upload Podcast
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Podcasts List */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Podcast</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Description Preview</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Release Date</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {podcasts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No podcasts yet. Click &quot;Upload New Podcast&quot; to add your first one.
                                        </td>
                                    </tr>
                                ) : (
                                    podcasts.map((podcast) => (
                                        <tr key={podcast.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg border border-white/5 ring-4 ring-purple-500/0 group-hover:ring-purple-500/10 transition-all shrink-0">
                                                        <Image
                                                            src={podcast.imageUrl || '/default-cover.png'}
                                                            alt={podcast.title}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <span className="font-medium text-white">{podcast.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-400 text-sm truncate max-w-xs">
                                                    {podcast.shortDescription}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(podcast.createdAt).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/edit/${podcast.id}`}
                                                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                        title="Edit podcast"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeletePodcast(podcast.id)}
                                                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                                        title="Delete podcast"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
