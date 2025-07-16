import { PrismaClient } from "@prisma/client";

(async () => {
  const prismaTest = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DOCKER_DATABASE_URL
      }
    }
  });
  await prismaTest.$executeRaw`
  TRUNCATE TABLE "Game" RESTART IDENTITY CASCADE;
  `;
  
  prismaTest.$disconnect();

})();

export { };