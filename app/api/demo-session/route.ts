// api/demo-session/route.ts
import { AccessToken } from "livekit-server-sdk";

type TokenEndpointRequest = {
  room_name?: string;
  participant_identity?: string;
  participant_name?: string;
  participant_metadata?: string | Record<string, any>;
  participant_attributes?: Record<string, string>;
  room_config?: Record<string, any>;

  timezone?: string;
  timezone_source?: string;
  browser_utc_offset_minutes?: number;
  browser_locale?: string;
};

function shortId() {
  return Math.random().toString(36).slice(2, 10);
}

function parseMetadata(input: TokenEndpointRequest["participant_metadata"]) {
  if (!input) return {};

  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch {
      return {};
    }
  }

  if (typeof input === "object") {
    return input;
  }

  return {};
}

function getQueryMetadata(req: Request) {
  const url = new URL(req.url);

  const timezone = url.searchParams.get("timezone");
  const timezoneSource = url.searchParams.get("timezone_source");
  const browserLocale = url.searchParams.get("browser_locale");
  const utcOffset = url.searchParams.get("browser_utc_offset_minutes");
  const parsedUtcOffset = utcOffset !== null ? Number(utcOffset) : undefined;

  return {
    ...(timezone ? { timezone } : {}),
    ...(timezoneSource ? { timezone_source: timezoneSource } : {}),
    ...(browserLocale ? { browser_locale: browserLocale } : {}),
    ...(Number.isFinite(parsedUtcOffset)
      ? { browser_utc_offset_minutes: parsedUtcOffset }
      : {}),
  };
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

  const queryMetadata = getQueryMetadata(req);

  const roomName = body.room_name ?? `alphaavatar-demo-${shortId()}`;
  const participantIdentity =
    body.participant_identity ?? `web-user-${shortId()}`;

  const baseMetadata = {
    room_type: "web_app",
    channel: "web_app",
    source: "alphaavatar-web",
  };

  const clientMetadata = parseMetadata(body.participant_metadata);

  const timeMetadata = {
    ...(queryMetadata ?? {}),
    ...(body.timezone ? { timezone: body.timezone } : {}),
    ...(body.timezone_source ? { timezone_source: body.timezone_source } : {}),
    ...(body.browser_utc_offset_minutes !== undefined
      ? { browser_utc_offset_minutes: body.browser_utc_offset_minutes }
      : {}),
    ...(body.browser_locale ? { browser_locale: body.browser_locale } : {}),
  };

  const mergedParticipantMetadata = {
    ...baseMetadata,
    ...clientMetadata,
    ...timeMetadata,
    timezone_source:
      timeMetadata.timezone_source ??
      clientMetadata.timezone_source ??
      (timeMetadata.timezone || clientMetadata.timezone ? "browser" : "server"),
  };

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: body.participant_name ?? participantIdentity,
      ttl: "10m",
      metadata: JSON.stringify(mergedParticipantMetadata),
      attributes: body.participant_attributes,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const roomConfig = {
      ...(body.room_config ?? {}),
      name: roomName,
      metadata: JSON.stringify(baseMetadata),
    };

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
