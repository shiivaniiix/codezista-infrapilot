console.log("NEON_ORG_ID AT FILE LOAD:", process.env.NEON_ORG_ID);



export async function createNeonProject(
  name: string
): Promise<{ projectId: string; connectionString: string }> {
  const apiKey = process.env.NEON_API_KEY;
  const orgId = "org-ancient-recipe-67010913";//process.env.NEON_ORG_ID;

  console.log("API KEY:", apiKey ? "EXISTS" : "MISSING");
  console.log("ORG ID:", orgId);

  if (!apiKey) {
    throw new Error("NEON_API_KEY environment variable is not set");
  }

  const body = {
    project: {
      name,
      region: "ap-southeast-1",
      org_id: orgId,
    },
  };

  console.log("FINAL BODY:", body);

  const response = await fetch("https://console.neon.tech/api/v2/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create Neon project: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = (await response.json()) as {
    project: {
      id: string;
    };
    connection_uris?: Array<{
      connection_uri: string;
    }>;
  };

  console.log("CREATE PROJECT RESPONSE:", data);

  const projectId = data.project.id;

  const connectionUri =
    data.connection_uris?.[0]?.connection_uri;

  if (!connectionUri) {
    throw new Error("Connection URI missing from project response");
  }

  return {
    projectId,
    connectionString: connectionUri,
  };
}
