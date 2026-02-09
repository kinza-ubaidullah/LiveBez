const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@livebaz.com';
    const password = 'AdminPassword123!'; // User should change this
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.adminUser.upsert({
        where: { email },
        update: {
            password: hashedPassword,
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Super Admin',
            role: 'ADMIN',
        },
    });

    console.log('-----------------------------------------------');
    console.log('ADMIN USER CREATED/UPDATED SUCCESSFULLY');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------------------');
    console.log('IMPORTANT: Please change this password after your first login.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
