import { prisma } from "../src/lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  await prisma.systemRecord.upsert({
    where: { key: "schema_version" },
    update: { value: "module-0" },
    create: { key: "schema_version", value: "module-0" }
  });

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, storeName: "Yoranzify" }
  });

  for (const [index, category] of [
    { name: "Women", slug: "women", description: "Contemporary silhouettes for every expression." },
    { name: "Men", slug: "men", description: "Refined essentials with an easy point of view." },
    { name: "Accessories", slug: "accessories", description: "Finishing details that make a look your own." }
  ].entries()) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: {}, create: { ...category, displayOrder: index } });
  }

  for (const [displayOrder, name] of ["XS", "S", "M", "L", "XL", "XXL"].entries()) {
    await prisma.size.upsert({ where: { name }, update: { displayOrder }, create: { name, displayOrder } });
  }
  for (const color of [{ name: "Black", hex: "#171814" }, { name: "White", hex: "#F5F3EC" }, { name: "Olive", hex: "#59624A" }, { name: "Clay", hex: "#A65E46" }]) {
    await prisma.color.upsert({ where: { name: color.name }, update: { hex: color.hex }, create: color });
  }

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminMobile = process.env.INITIAL_ADMIN_MOBILE?.replace(/\D/g, "");

  if (adminEmail && adminPassword && adminMobile) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN", isActive: true },
      create: {
        name: process.env.INITIAL_ADMIN_NAME?.trim() || "Store Admin",
        email: adminEmail,
        mobile: adminMobile,
        passwordHash: await hash(adminPassword, 12),
        role: "ADMIN"
      }
    });
  }
}

main().finally(() => prisma.$disconnect());
