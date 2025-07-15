import * as arctic from "arctic";

const aniAuth = new arctic.AniList(
  Bun.env.ANILIST_CLIENT_ID,
  Bun.env.ANILIST_CLIENT_SECRET,
  Bun.env.ANILIST_REDIRECT_URI
);

const tokens = await aniAuth.validateAuthorizationCode(code);
