'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { upload } from '@vercel/blob/client';
import { Podcast } from '@/types';

export default function EditPodcastPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [fullDescription, setFullDescription] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

    // File uploads
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const audioInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const init = async () => {
            await checkAuth();
            await fetchPodcast();
        };
        init();
    }, [id]);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/admin/verify');
            const data = await response.json();
            if (!data.authenticated) {
                router.push('/admin');
            }
        } catch (err) {
            router.push('/admin');
        }
    };

    const fetchPodcast = async () => {
        try {
            const response = await fetch(`/api/podcasts/${id}`);
            if (!response.ok) throw new Error('Failed to fetch podcast');

            const podcast: Podcast = await response.json();
            setTitle(podcast.title);
            setShortDescription(podcast.shortDescription);
            setFullDescription(podcast.fullDescription || '');
            setCurrentImageUrl(podcast.imageUrl || null);
            setCurrentAudioUrl(podcast.audioUrl);
        } catch (err) {
            setError('Failed to load podcast details');
            console.error(err);
        } finally {
            setLoading(false);
        }
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
        setSaving(true);
        setError('');

        try {
            let audioUrl = currentAudioUrl;
            let imageUrl = currentImageUrl;

            // 1. Upload New Audio (if changed)
            if (audioFile) {
                try {
                    const audioBlob = await upload(audioFile.name, audioFile, {
                        access: 'public',
                        handleUploadUrl: '/api/upload',
                    });
                    audioUrl = audioBlob.url;
                } catch (err) {
                    console.error('Audio upload failed:', err);
                    throw new Error('Failed to upload new audio file');
                }
            }

            // 2. Upload New Image (if changed)
            if (imageFile) {
                try {
                    const imageBlob = await upload(imageFile.name, imageFile, {
                        access: 'public',
                        handleUploadUrl: '/api/upload',
                    });
                    imageUrl = imageBlob.url;
                } catch (err) {
                    console.error('Image upload failed:', err);
                    throw new Error('Failed to upload new image file');
                }
            }

            // 3. Update Podcast Record
            const response = await fetch(`/api/podcasts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    shortDescription,
                    fullDescription,
                    audioUrl,
                    imageUrl,
                }),
            });

            if (response.ok) {
                router.push('/admin/dashboard');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update podcast');
            }
        } catch (err: any) {
            console.error('Update error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-50 glass border-b border-purple-500/20">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back to Dashboard</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-700" />
                            <h1 className="text-lg font-semibold text-white">Edit Podcast</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container-custom py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="card p-8">
                        <h2 className="text-2xl font-bold text-white mb-8">Edit Podcast Details</h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                            required
                                            maxLength={200}
                                        />
                                        <p className="text-gray-500 text-xs mt-1">
                                            {shortDescription.length}/200 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-300 mb-2">
                                            Full Description <span className="text-gray-500 font-normal ml-1">(supports Markdown: **bold**, list items, single break = new line)</span>
                                        </label>
                                        <textarea
                                            id="fullDescription"
                                            value={fullDescription}
                                            onChange={(e) => setFullDescription(e.target.value)}
                                            className="input min-h-32 resize-y"
                                            rows={6}
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Audio File
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
                                                    <p className="text-gray-400">Upload new audio file</p>
                                                    <p className="text-gray-500 text-sm mt-1">Leave empty to keep current file</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Cover Image
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
                                                <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : currentImageUrl ? (
                                                <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden group">
                                                    <Image
                                                        src={currentImageUrl}
                                                        alt="Current Cover"
                                                        fill
                                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs font-medium">Change Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-400">Upload new image</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
                                <Link
                                    href="/admin/dashboard"
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-primary min-w-[120px]"
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </div>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
