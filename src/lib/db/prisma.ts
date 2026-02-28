import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;
export default prismaClient;


const orgId = process.env.NEON_ORG_ID;
console.log("ORG ID FROM ENV:", orgId);