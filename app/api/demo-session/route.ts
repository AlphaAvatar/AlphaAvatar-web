// api/demo-session/route.ts
import { AccessToken } from "livekit-server-sdk";

type TokenEndpointRequest = {
  room_name?: string;
  participant_identity?: string;
  participant_name?: string;
  participant_metadata?: string;
  participant_attributes?: Record<string, string>;
  room_config?: Record<string, any>;
};

function shortId() {
  return Math.random().toString(36).slice(2, 10);
}

async function handleTokenRequest(req: Request) {
  const livekitUrl = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!livekitUrl || !apiKey || !apiSecret) {
    return Response.json(
      {
        error: "Missing LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET",
      },
      { status: 500 }
    );
  }

  let body: TokenEndpointRequest = {};
  try {
    if (req.method === "POST") {
      body = await req.json();
    }
  } catch {
    body = {};
  }

  const roomName = body.room_name ?? `alphaavatar-demo-${shortId()}`;
  const participantIdentity =
    body.participant_identity ?? `web-user-${shortId()}`;

  const mergedMetadata = {
    room_type: "web_app",
    channel: "web_app",
    source: "alphaavatar-web",
  };

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: body.participant_name ?? participantIdentity,
      ttl: "10m",
      metadata:
        body.participant_metadata ??
        JSON.stringify({
          source: "alphaavatar-web",
        }),
      attributes: body.participant_attributes,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Key point: room_config must be directly attached to the token,
    // it cannot be put into addGrant().
    const roomConfig = {
      ...(body.room_config ?? {}),
      name: roomName,
      metadata: JSON.stringify(mergedMetadata),
    };

    // livekit-server-sdk 的 JS 用法
    (at as any).roomConfig = roomConfig;

    const participantToken = await at.toJwt();

    return Response.json(
      {
        server_url: livekitUrl,
        participant_token: participantToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("demo-session error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handleTokenRequest(req);
}

export async function GET(req: Request) {
  return handleTokenRequest(req);
}
