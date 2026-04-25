import { AccessToken } from "livekit-server-sdk";

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return Response.json(
      { error: "Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET" },
      { status: 500 }
    );
  }

  const identity = `web-user-${Math.random().toString(36).slice(2, 10)}`;
  const room = "alphaavatar-demo";

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "10m",
  });

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();

  return Response.json({
    token,
    room,
    identity,
  });
}
