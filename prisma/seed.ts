import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('adminpodcast2211', 10);

    const admin = await prisma.admin.upsert({
        where: { username: 'admin1122' },
        update: {},
        create: {
            username: 'admin1122',
            password: hashedPassword,
        },
    });

    console.log('Admin user created:', admin.username);

    // Check if podcasts already exist
    const existingPodcasts = await prisma.podcast.count();

    if (existingPodcasts === 0) {
        // Create sample podcasts for testing
        const samplePodcasts = [
            {
                title: 'Introduction to Telecommunications Safety',
                shortDescription: 'A comprehensive overview of safety protocols in the telecommunications industry.',
                fullDescription: 'This episode covers the essential safety protocols that every telecommunications professional should know. We discuss OSHA regulations, proper equipment handling, and best practices for working with high-voltage equipment. Whether you\'re new to the industry or a seasoned professional, this episode provides valuable insights into maintaining a safe work environment.',
                audioUrl: '/uploads/audio/sample.mp3',
                imageUrl: '/default-cover.png',
            },
            {
                title: 'UK Health & Safety Regulations 2024 Update',
                shortDescription: 'Latest changes to health and safety regulations affecting UK workplaces.',
                fullDescription: 'Stay up-to-date with the latest Health & Safety Executive (HSE) regulations introduced in 2024. This episode breaks down the key changes, their implications for employers and employees, and practical steps for compliance. We interview industry experts and HSE representatives to bring you the most accurate and actionable information.',
                audioUrl: '/uploads/audio/sample.mp3',
                imageUrl: '/default-cover.png',
            },
            {
                title: 'Workplace Safety Best Practices',
                shortDescription: 'Essential tips for maintaining a safe and healthy workplace environment.',
                fullDescription: 'Creating a culture of safety starts with understanding and implementing best practices. In this episode, we explore proactive measures that organizations can take to prevent accidents and promote employee wellbeing. From risk assessments to emergency preparedness, we cover all aspects of comprehensive workplace safety management.',
                audioUrl: '/uploads/audio/sample.mp3',
                imageUrl: '/default-cover.png',
            },
        ];

        for (const podcast of samplePodcasts) {
            await prisma.podcast.create({
                data: podcast,
            });
        }

        console.log('Sample podcasts created');
    } else {
        console.log('Podcasts already exist, skipping sample creation');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
