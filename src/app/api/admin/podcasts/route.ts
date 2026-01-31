import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getDefaultCoverImage } from '@/lib/upload';

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

        // Parse request body
        const body = await request.json();
        const { title, shortDescription, fullDescription, audioUrl, imageUrl } = body;

        // Validate required fields
        if (!title || !shortDescription || !audioUrl) {
            return NextResponse.json(
                { error: 'Title, short description, and audio URL are required' },
                { status: 400 }
            );
        }

        // Create podcast in database
        const podcast = await prisma.podcast.create({
            data: {
                title,
                shortDescription,
                fullDescription: fullDescription || null,
                audioUrl,
                imageUrl: imageUrl || getDefaultCoverImage(),
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
