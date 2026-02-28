import { NextRequest, NextResponse } from "next/server";
import { createDeployment } from "../../../lib/services/deployment.service";;

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