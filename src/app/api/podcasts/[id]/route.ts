import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { saveFile } from '@/lib/upload';
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
        const formData = await request.formData();

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

        const title = formData.get('title') as string;
        const shortDescription = formData.get('shortDescription') as string;
        const fullDescription = formData.get('fullDescription') as string;
        const audioFile = formData.get('audioFile') as File | null;
        const imageFile = formData.get('imageFile') as File | null;

        let audioUrl = existingPodcast.audioUrl;
        let imageUrl = existingPodcast.imageUrl;

        // Handle File Updates
        if (audioFile) {
            // Delete old audio if it exists and is a blob URL
            if (audioUrl.includes('public.blob.vercel-storage.com')) {
                try {
                    await del(audioUrl);
                } catch (e) {
                    console.error('Failed to delete old audio file:', e);
                }
            }
            audioUrl = await saveFile(audioFile, 'audio');
        }

        if (imageFile) {
            // Delete old image if it exists and is a blob URL
            if (imageUrl && imageUrl.includes('public.blob.vercel-storage.com')) {
                try {
                    await del(imageUrl);
                } catch (e) {
                    console.error('Failed to delete old image file:', e);
                }
            }
            imageUrl = await saveFile(imageFile, 'images');
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
