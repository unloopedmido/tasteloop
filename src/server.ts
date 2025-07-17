import Express from "express";
import { log } from "@/utils/logger";
import { handleCallback } from "@/lib/auth";

const app = Express();
const port = Bun.env.SERVER_PORT || 3001;

app.get("/callback", handleCallback);

export function startServer() {
  app.listen(port, () => {
    log.success(`Server is running on port ${port}`);
  });
}
