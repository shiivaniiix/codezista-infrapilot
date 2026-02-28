import prisma from "../db/prisma";
import { createNeonProject } from "../providers/neon";
import { Deployment, DeploymentStatus } from "@prisma/client";

export async function createDeployment(
  name: string,
  userId: string
): Promise<Deployment> {
  const deployment = await prisma.deployment.create({
    data: {
      name,
      status: DeploymentStatus.PROVISIONING,
      userId,
    },
  });

  try {
    const { projectId, connectionString } =
      await createNeonProject(name);

    const updatedDeployment = await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        neonProjectId: projectId,
        neonDatabaseUrl: connectionString,
        status: "SUCCESS",
      },
    });

    return updatedDeployment;
  } catch (error) {
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: DeploymentStatus.FAILED,
      },
    });

    throw error;
  }
}