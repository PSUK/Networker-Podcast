export interface Podcast {
    id: string;
    title: string;
    shortDescription: string;
    fullDescription: string | null;
    audioUrl: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PodcastFormData {
    title: string;
    shortDescription: string;
    fullDescription?: string;
    audioFile: File;
    imageFile?: File;
}

export interface Admin {
    id: string;
    username: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    message?: string;
}
