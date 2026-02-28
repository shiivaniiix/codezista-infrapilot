-- AlterEnum
ALTER TYPE "DeploymentStatus" RENAME TO "DeploymentStatus_old";
CREATE TYPE "DeploymentStatus" AS ENUM ('PROVISIONING', 'SUCCESS', 'FAILED');
ALTER TABLE "Deployment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Deployment" ALTER COLUMN "status" TYPE "DeploymentStatus" USING (
  CASE 
    WHEN "status"::text = 'PENDING' THEN 'PROVISIONING'::"DeploymentStatus"
    WHEN "status"::text = 'DEPLOYING' THEN 'PROVISIONING'::"DeploymentStatus"
    WHEN "status"::text = 'PROVISIONING' THEN 'PROVISIONING'::"DeploymentStatus"
    WHEN "status"::text = 'SUCCESS' THEN 'SUCCESS'::"DeploymentStatus"
    WHEN "status"::text = 'FAILED' THEN 'FAILED'::"DeploymentStatus"
    ELSE 'PROVISIONING'::"DeploymentStatus"
  END
);
ALTER TABLE "Deployment" ALTER COLUMN "status" SET DEFAULT 'PROVISIONING'::"DeploymentStatus";
DROP TYPE "DeploymentStatus_old";

