import prisma from "../../../../../lib/db/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const events = await prisma.deploymentEvent.findMany({
      where: { deploymentId: id },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(events), {
      status: 200,
    });
  } catch (error) {
    console.error("GET DEPLOYMENT EVENTS ERROR:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}

