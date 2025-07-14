import type { ButtonParams } from "@/types";

export abstract class BaseButton {
  public abstract customId: string;

  public abstract execute(params: ButtonParams): Promise<void>;
}
