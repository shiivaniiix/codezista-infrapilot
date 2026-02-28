import { NextRequest, NextResponse } from "next/server";
import { createDeployment } from "../../../lib/services/deployment.service";
import prisma from "../../../lib/db/prisma";

export async function GET() {
  try {
    const deployments = await prisma.deployment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        status: true,
        neonProjectId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(deployments);
  } catch (error: any) {
    console.error("GET DEPLOYMENTS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch deployments",
        message: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  try {
    // Temporary fake userId for MVP
    const deployment = await createDeployment(
      name,
      "temp-user-id"
    );

    return NextResponse.json(deployment);
  } catch (error: any) {
    console.error("DEPLOYMENT ERROR:", error);
  
    return NextResponse.json(
      {
        error: "Deployment failed",
        message: error?.message,
      },
      { status: 500 }
    );
  }
}