//import getPort, { makeRange } from "get-port";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import "dotenv/config";

type TestContext = {
  prisma: PrismaClient;
};
interface TestContentArgs {
  portRange: {
    from: number;
    to: number;
  }
}

const prismaBinary = join(__dirname, "../../..", "node_modules", ".bin", "prisma");

export function createTestContext(arg: TestContentArgs): TestContext {
  let ctx = {} as TestContext;

  const prismaCtx = prismaTestContext();
  execSync(
    `DATABASE_URL="${process.env.DATABASE_TEST_URL}" ${prismaBinary} db push`,
    { stdio: "inherit" }
  );

  beforeEach(async () => {
    const prisma = await prismaCtx.before();

    Object.assign(ctx, {
      prisma
    });
  });
  afterEach(async () => {
    await prismaCtx.after();
  });
  return ctx;
}

function prismaTestContext() {
  let prismaClient: null | PrismaClient = null;
  return {
    async before() {
      prismaClient = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_TEST_URL
          }
        }
      });
      execSync(
        `DATABASE_URL="${process.env.DATABASE_TEST_URL}" ${prismaBinary} db seed`,
        { stdio: "inherit" }
      );

      return prismaClient;
    },
    async after() {
      await prismaClient?.$disconnect();
    },
  };
}
