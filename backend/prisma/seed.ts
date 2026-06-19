import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { phoneNumber: '+250788000001' },
    update: {},
    create: {
      phoneNumber: '+250788000001',
      passwordHash: await bcrypt.hash('Password123!', 12),
      fullName: 'Samba Foods Owner',
      role: 'RESTAURANT_OWNER',
      isVerified: true,
    },
  });

  const samba = await prisma.restaurant.upsert({
    where: { id: 'seed-restaurant-samba-foods' },
    update: {},
    create: {
      id: 'seed-restaurant-samba-foods',
      ownerUserId: owner.id,
      businessName: 'Samba Foods',
      rdbNumber: 'RDB-0001',
      lat: -1.9536,
      lng: 30.0925,
      addressDetails: 'KG 17 St, Kimironko',
      coverPhotoUrl: 'https://picsum.photos/seed/samba-cover/800/400',
      logoUrl: 'https://picsum.photos/seed/samba-logo/200/200',
      isApproved: true,
      isOpen: true,
      avgRating: 4.2,
      commissionPercent: 10,
    },
  });

  for (let day = 0; day <= 6; day++) {
    await prisma.restaurantHours.upsert({
      where: { id: `seed-hours-samba-${day}` },
      update: {},
      create: {
        id: `seed-hours-samba-${day}`,
        restaurantId: samba.id,
        dayOfWeek: day,
        openTime: '08:00',
        closeTime: '22:00',
        isClosed: false,
      },
    });
  }

  const section = await prisma.menuSection.upsert({
    where: { id: 'seed-section-samba-all' },
    update: {},
    create: {
      id: 'seed-section-samba-all',
      restaurantId: samba.id,
      name: 'All menus',
      displayOrder: 0,
    },
  });

  const items = [
    {
      id: 'seed-item-classic-burger',
      name: 'Classic Burger',
      category: 'BURGER' as const,
      priceRwf: 12500,
      photoUrl: 'https://picsum.photos/seed/classic-burger/400/400',
      avgRating: 4.7,
    },
    {
      id: 'seed-item-cola',
      name: 'Cola',
      category: 'JUICE' as const,
      priceRwf: 3990,
      photoUrl: 'https://picsum.photos/seed/cola/400/400',
      avgRating: 4.4,
    },
    {
      id: 'seed-item-pepperoni-pizza',
      name: 'Pepperoni Cheese Pizza',
      category: 'PIZZA' as const,
      priceRwf: 12500,
      photoUrl: 'https://picsum.photos/seed/pepperoni-pizza/400/400',
      avgRating: 4.8,
    },
  ];

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        sectionId: section.id,
        restaurantId: samba.id,
        name: item.name,
        category: item.category,
        priceRwf: item.priceRwf,
        photoUrl: item.photoUrl,
        isAvailable: true,
        avgRating: item.avgRating,
      },
    });
  }

  console.log('Seed complete:', { restaurant: samba.businessName, items: items.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
