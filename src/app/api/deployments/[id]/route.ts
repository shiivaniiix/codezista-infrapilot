import prisma from "../../../../lib/db/prisma";
import { DeploymentStatus } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    let deployment = await prisma.deployment.findUnique({
      where: { id },
    });

    if (!deployment) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    }

    // Sync status from Neon API if project exists
    if (deployment.neonProjectId) {
      const apiKey = process.env.NEON_API_KEY;
      if (apiKey) {
        try {
          const neonResponse = await fetch(
            `https://console.neon.tech/api/v2/projects/${deployment.neonProjectId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            }
          );

          if (neonResponse.ok) {
            const neonData = (await neonResponse.json()) as {
              project?: {
                branch?: {
                  current_state?: string;
                };
                endpoint?: {
                  current_state?: string;
                };
              };
            };

            // Extract state from branch or endpoint
            const state =
              neonData.project?.branch?.current_state ||
              neonData.project?.endpoint?.current_state;

            if (state) {
              // Map Neon state to our status
              let mappedStatus: DeploymentStatus;
              if (state === "init" || state === "creating") {
                mappedStatus = DeploymentStatus.PROVISIONING;
              } else if (state === "active" || state === "ready") {
                mappedStatus = DeploymentStatus.SUCCESS;
              } else if (state === "failed") {
                mappedStatus = DeploymentStatus.FAILED;
              } else {
                // Unknown state, keep current status
                mappedStatus = deployment.status as DeploymentStatus;
              }

              // Update if status changed
              if (mappedStatus !== deployment.status) {
                deployment = await prisma.deployment.update({
                  where: { id },
                  data: {
                    status: mappedStatus,
                    events: {
                      create: {
                        type: "STATUS_CHANGED",
                        message: `Status updated to ${mappedStatus}`,
                      },
                    },
                  },
                });
              }
            }
          }
        } catch (neonError) {
          console.error("Error syncing Neon status:", neonError);
          // Continue with existing deployment data
        }
      }
    }

    return new Response(JSON.stringify(deployment), {
      status: 200,
    });
  } catch (error) {
    console.error("GET DEPLOYMENT ERROR:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const deployment = await prisma.deployment.findUnique({
      where: { id },
    });

    if (!deployment) {
      return new Response(JSON.stringify({ error: "Deployment not found" }), {
        status: 404,
      });
    }

    // Delete Neon project if it exists
    if (deployment.neonProjectId) {
      const apiKey = process.env.NEON_API_KEY;
      if (!apiKey) {
        console.error("NEON_API_KEY not set, skipping Neon project deletion");
      } else {
        try {
          const neonResponse = await fetch(
            `https://console.neon.tech/api/v2/projects/${deployment.neonProjectId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            }
          );

          if (!neonResponse.ok) {
            const errorText = await neonResponse.text();
            console.error(
              `Failed to delete Neon project: ${neonResponse.status} ${neonResponse.statusText} - ${errorText}`
            );
            // Continue with DB deletion even if Neon deletion fails
          }
        } catch (neonError) {
          console.error("Error deleting Neon project:", neonError);
          // Continue with DB deletion even if Neon deletion fails
        }
      }
    }

    // Delete deployment from database (cascade will delete events)
    await prisma.deployment.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("DELETE DEPLOYMENT ERROR:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete deployment" }),
      {
        status: 500,
      }
    );
  }
}

