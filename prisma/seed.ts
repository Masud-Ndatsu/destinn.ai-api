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
