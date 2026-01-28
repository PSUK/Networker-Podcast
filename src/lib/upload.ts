import { put } from '@vercel/blob';

export async function saveFile(
    file: File,
    type: 'audio' | 'images'
): Promise<string> {
    const filename = `${type}/${crypto.randomUUID()}-${file.name}`;

    const blob = await put(filename, file, {
        access: 'public',
    });

    return blob.url;
}

export function getDefaultCoverImage(): string {
    return '/default-cover.png';
}
