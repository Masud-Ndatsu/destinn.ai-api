import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';

const prisma = new PrismaService();
const util = new UtilsService();

const categories = [
  { name: 'Scholarships' },
  { name: 'Fellowships' },
  { name: 'Internships' },
  { name: 'Competitions' },
  { name: 'Jobs' },
  { name: 'Grants' },
];

async function main() {
  console.log('Seeding admin user...');
  const adminEmail = 'adminuser@app.com';
  const adminPassword = 'Password123$';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password_hash: await util.hashPassword(adminPassword),
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created with email: ${adminEmail}`);

  console.log('Seeding categories...');

  for (const category of categories) {
    const slug = util.slugify(category.name);
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: category.name,
        slug,
      },
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
