import type { ClientEvents } from "discord.js";
import type { ExtendedClient } from "./client";

export abstract class BaseClientEvent<
  T extends keyof ClientEvents = keyof ClientEvents,
> {
  public abstract data: {
    name: T;
    once?: boolean;
  };

  public abstract execute(
    client: ExtendedClient,
    ...args: ClientEvents[T]
  ): Promise<void>;
}
