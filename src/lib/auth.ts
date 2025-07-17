import type { Request, Response } from "express";
import { type JwtPayload, decode } from "jsonwebtoken";
import { prisma } from "./db";

export function generateAuthURL(state: string) {
  const params = new URLSearchParams({
    client_id: Bun.env.ANILIST_CLIENT_ID!,
    redirect_uri: Bun.env.ANILIST_REDIRECT_URI!,
    response_type: "code",
    state,
  });

  return `https://anilist.co/api/v2/oauth/authorize?${params}`;
}

export async function handleCallback(req: Request, res: Response) {
  const { code, state: discordID } = req.query;

  const tokenRes = await fetch("https://anilist.co/api/v2/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: Bun.env.ANILIST_CLIENT_ID,
      client_secret: Bun.env.ANILIST_CLIENT_SECRET,
      redirect_uri: Bun.env.ANILIST_REDIRECT_URI,
      code: code as string,
    }),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    res.status(tokenRes.status).send(`Failed to fetch token: ${errorBody}`);
    return;
  }

  const tokenJson = await tokenRes.json();
  const { access_token } = tokenJson;

  if (!access_token) {
    res.status(400).send("No access_token received from Anilist.");
    return;
  }

  const decodedToken = decode(access_token) as JwtPayload;

  await prisma.user.upsert({
    where: {
      id: discordID as string,
    },
    update: {
      accessToken: access_token,
      expiresAt: new Date(Number(decodedToken.exp) * 1000),
    },
    create: {
      id: discordID as string,
      accessToken: access_token,
      anilistId: Number(decodedToken.sub),
      expiresAt: new Date(Number(decodedToken.exp) * 1000),
    },
  });

  res.send(
    "Successfully authenticated with Anilist. You can close this window.",
  );
}

export async function authenticatedQuery(
  discordID: string,
  query: string,
  vars: Record<string, unknown> = {},
) {
  const user = await prisma.user.findUnique({ where: { id: discordID } });

  if (!user || !user.accessToken) {
    throw new Error("User not authenticated with Anilist");
  }

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: vars }),
  });

  return res.json();
}
