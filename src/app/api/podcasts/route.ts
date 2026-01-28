import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all podcasts (sorted by newest first)
export async function GET() {
    try {
        const podcasts = await prisma.podcast.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(podcasts);
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch podcasts' },
            { status: 500 }
        );
    }
}
