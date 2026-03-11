import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.emailLog.deleteMany({}),
    prisma.caseFile.deleteMany({}),
    prisma.case.deleteMany({}),
    prisma.notificationRecipient.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
  console.log("✅ Demo data cleared.");
}

main()
  .catch((e) => {
    console.error("❌ Clear failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
