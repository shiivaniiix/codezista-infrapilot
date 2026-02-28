-- AlterTable
ALTER TABLE "Deployment" ALTER COLUMN "neonProjectId" DROP NOT NULL,
ALTER COLUMN "neonDatabaseUrl" DROP NOT NULL,
ALTER COLUMN "vercelProjectId" DROP NOT NULL;
