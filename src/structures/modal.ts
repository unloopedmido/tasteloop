import type { ModalParams } from "@/types";

export abstract class BaseModal {
  public abstract customId: string;

  public abstract execute(params: ModalParams): Promise<void>;
}
