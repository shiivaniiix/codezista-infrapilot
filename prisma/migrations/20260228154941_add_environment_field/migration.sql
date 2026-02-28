/*
  Warnings:

  - You are about to drop the column `deploymentUrl` on the `Deployment` table. All the data in the column will be lost.
  - You are about to drop the column `vercelDeploymentId` on the `Deployment` table. All the data in the column will be lost.
  - You are about to drop the column `vercelProjectId` on the `Deployment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deployment" DROP COLUMN "deploymentUrl",
DROP COLUMN "vercelDeploymentId",
DROP COLUMN "vercelProjectId",
ALTER COLUMN "status" DROP DEFAULT;
