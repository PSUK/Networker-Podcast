import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// Add GET method for verification
export async function GET(request: Request): Promise<NextResponse> {
    return NextResponse.json({ status: 'Upload API is active' });
}

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token || !verifyToken(token)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (
                pathname
                /* clientPayload */
            ) => {
                // We can add more specific validation here if needed
                // For now, we trust authenticated admins
                return {
                    allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'image/jpeg', 'image/png', 'image/webp'],
                    tokenPayload: JSON.stringify({
                        // optional, sent to your server on upload completion
                        // userEmail: user.email,
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Available for post-upload handling (e.g. logging)
                console.log('blob uploaded', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }, // The webhook will retry 5 times automatically if the status is 400-599
        );
    }
}
