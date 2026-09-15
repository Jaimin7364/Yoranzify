import { prisma } from "../../src/lib/prisma";

export default async function globalSetup() {
  if (process.env.NODE_ENV === "production") throw new Error("E2E tests must not run against production.");
  await prisma.rateLimit.deleteMany();
  await prisma.siteSetting.update({ where: { id: 1 }, data: { logoMediaId: null, faviconMediaId: null, freeShippingAbovePaise: 199900, maintenanceMode: false } });
  await prisma.$disconnect();
}
