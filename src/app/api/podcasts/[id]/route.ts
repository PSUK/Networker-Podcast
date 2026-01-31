import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { saveFile } from '@/lib/upload';
import { del } from '@vercel/blob';

// GET single podcast by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const podcast = await prisma.podcast.findUnique({
            where: { id },
        });

        if (!podcast) {
            return NextResponse.json(
                { error: 'Podcast not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(podcast);
    } catch (error) {
        console.error('Error fetching podcast:', error);
        return NextResponse.json(
            { error: 'Failed to fetch podcast' },
            { status: 500 }
        );
    }
}

// PUT (Update) podcast
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, shortDescription, fullDescription, audioUrl, imageUrl } = body;

        // Fetch existing podcast to handle file deletion if needed
        const existingPodcast = await prisma.podcast.findUnique({
            where: { id },
        });

        if (!existingPodcast) {
            return NextResponse.json(
                { error: 'Podcast not found' },
                { status: 404 }
            );
        }

        // Handle File Deletions (only if URL has changed)
        if (audioUrl && audioUrl !== existingPodcast.audioUrl) {
            // Delete old audio if it exists and is a blob URL
            if (existingPodcast.audioUrl.includes('public.blob.vercel-storage.com')) {
                try {
                    await del(existingPodcast.audioUrl);
                } catch (e) {
                    console.error('Failed to delete old audio file:', e);
                }
            }
        }

        if (imageUrl && imageUrl !== existingPodcast.imageUrl) {
            // Delete old image if it exists and is a blob URL
            if (existingPodcast.imageUrl && existingPodcast.imageUrl.includes('public.blob.vercel-storage.com')) {
                try {
                    await del(existingPodcast.imageUrl);
                } catch (e) {
                    console.error('Failed to delete old image file:', e);
                }
            }
        }

        const updatedPodcast = await prisma.podcast.update({
            where: { id },
            data: {
                title,
                shortDescription,
                fullDescription,
                audioUrl,
                imageUrl,
            },
        });

        return NextResponse.json(updatedPodcast);

    } catch (error) {
        console.error('Error updating podcast:', error);
        return NextResponse.json(
            { error: 'Failed to update podcast' },
            { status: 500 }
        );
    }
}

// DELETE podcast by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const podcast = await prisma.podcast.findUnique({
            where: { id },
        });

        if (podcast) {
            // Try to delete associated files from Blob storage
            if (podcast.audioUrl.includes('public.blob.vercel-storage.com')) {
                try {
                    await del(podcast.audioUrl);
                } catch (e) {
                    console.error('Failed to delete audio file:', e);
                }
            }
            if (podcast.imageUrl?.includes('public.blob.vercel-storage.com')) {
                try {
                    await del(podcast.imageUrl);
                } catch (e) {
                    console.error('Failed to delete image file:', e);
                }
            }
        }

        await prisma.podcast.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting podcast:', error);
        return NextResponse.json(
            { error: 'Failed to delete podcast' },
            { status: 500 }
        );
    }
}
