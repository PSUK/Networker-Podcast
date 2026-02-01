import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        // Default to NPKELLY2026 if env var is not set
        const SITE_PASSWORD = process.env.SITE_PASSWORD || 'NPKELLY2026';

        if (password === SITE_PASSWORD) {
            const cookieStore = await cookies();

            // Set a long-lived cookie for site access
            cookieStore.set('site-access-token', 'granted', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
