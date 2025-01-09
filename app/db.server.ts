import { PrismaClient } from "@prisma/client";
let prisma: PrismaClient;
declare global {
  var __prisma: PrismaClient | undefined;
}
// Prevent creating multiple instances in development (hot reload issue)
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}
console.log("Available models:", Object.keys(prisma));
export default prisma;
