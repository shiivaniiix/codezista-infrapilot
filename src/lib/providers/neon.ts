export async function createNeonProject(
  name: string
): Promise<{ projectId: string; connectionString: string }> {
  const apiKey = process.env.NEON_API_KEY;
  if (!apiKey) {
    throw new Error("NEON_API_KEY environment variable is not set");
  }

  const response = await fetch("https://console.neon.tech/api/v2/projects", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project: {
        name,
      },
    }),
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
  };

  const projectId = data.project.id;

  const connectionResponse = await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/connection_uris`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!connectionResponse.ok) {
    const errorText = await connectionResponse.text();
    throw new Error(
      `Failed to get Neon connection URI: ${connectionResponse.status} ${connectionResponse.statusText} - ${errorText}`
    );
  }

  const connectionData = (await connectionResponse.json()) as {
    connection_uris: Array<{
      connection_uri: string;
    }>;
  };

  const connectionUri = connectionData.connection_uris[0]?.connection_uri;
    if (!connectionUri) {
    throw new Error("Neon connection URI not found in response");
}
  return {
    projectId,
    connectionString : connectionUri,
  };
}

