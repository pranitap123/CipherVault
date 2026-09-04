import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@ciphervault.dev";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: "ADMIN" },
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            role: "ADMIN",
        },
    });

    console.log(`Seeded admin user: ${admin.email} (role: ${admin.role})`);
    if (!process.env.SEED_ADMIN_PASSWORD) {
        console.log(
            `Default admin password is "ChangeMe123!" — override with SEED_ADMIN_PASSWORD before running this against anything but a local DB.`
        );
    }

    // A regular (non-admin) demo account. This is what the landing page's
    // "Sign in as member" button actually logs into — without this, that
    // button would point at credentials that don't exist in the real DB.
    const memberEmail = process.env.SEED_MEMBER_EMAIL ?? "demo@ciphervault.dev";
    const memberPassword = process.env.SEED_MEMBER_PASSWORD ?? "DemoPass123!";

    const hashedMemberPassword = await bcrypt.hash(memberPassword, 10);

    const member = await prisma.user.upsert({
        where: { email: memberEmail },
        update: { role: "USER" },
        create: {
            email: memberEmail,
            password: hashedMemberPassword,
            role: "USER",
        },
    });

    console.log(`Seeded member user: ${member.email} (role: ${member.role})`);
    if (!process.env.SEED_MEMBER_PASSWORD) {
        console.log(
            `Default member password is "DemoPass123!" — override with SEED_MEMBER_PASSWORD before running this against anything but a local DB.`
        );
    }
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
