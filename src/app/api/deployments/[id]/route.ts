import prisma from "../../../../lib/db/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const deployment = await prisma.deployment.findUnique({
      where: { id },
    });

    if (!deployment) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
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

    // Delete deployment from database
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

