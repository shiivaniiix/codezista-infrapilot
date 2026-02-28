-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('DEV', 'UAT', 'PROD');

-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "environment" "Environment" NOT NULL DEFAULT 'DEV';
