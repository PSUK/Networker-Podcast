import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { saveFile, getDefaultCoverImage } from '@/lib/upload';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const shortDescription = formData.get('shortDescription') as string;
        const fullDescription = formData.get('fullDescription') as string | null;
        const audioFile = formData.get('audioFile') as File;
        const imageFile = formData.get('imageFile') as File | null;

        // Validate required fields
        if (!title || !shortDescription || !audioFile) {
            return NextResponse.json(
                { error: 'Title, short description, and audio file are required' },
                { status: 400 }
            );
        }

        // Save audio file
        const audioUrl = await saveFile(audioFile, 'audio');

        // Save image file or use default
        let imageUrl = getDefaultCoverImage();
        if (imageFile && imageFile.size > 0) {
            imageUrl = await saveFile(imageFile, 'images');
        }

        // Create podcast in database
        const podcast = await prisma.podcast.create({
            data: {
                title,
                shortDescription,
                fullDescription: fullDescription || null,
                audioUrl,
                imageUrl,
            },
        });

        return NextResponse.json(podcast, { status: 201 });
    } catch (error) {
        console.error('Error uploading podcast:', error);
        return NextResponse.json(
            { error: 'Failed to upload podcast' },
            { status: 500 }
        );
    }
}
