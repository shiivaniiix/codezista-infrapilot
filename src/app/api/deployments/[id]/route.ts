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

