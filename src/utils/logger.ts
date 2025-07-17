import chalk from "chalk";
import dayjs from "dayjs";

export const log = {
  info: (msg: string) => {
    console.info(
      `${chalk.gray(dayjs().format("HH:mm:ss"))} ${chalk.blue("[INFO]")} ${msg}`,
    );
  },
  warn: (msg: string) => {
    console.warn(
      `${chalk.gray(dayjs().format("HH:mm:ss"))} ${chalk.yellow(
        "[WARN]",
      )} ${msg}`,
    );
  },
  error: (msg: string, error?: unknown) => {
    console.error(
      `${chalk.gray(dayjs().format("HH:mm:ss"))} ${chalk.red(
        "[ERROR]",
      )} ${msg}`,
      error ? `\n${chalk.red(error)}` : "",
    );
  },
  success: (msg: string) => {
    console.log(
      `${chalk.gray(dayjs().format("HH:mm:ss"))} ${chalk.green(
        "[SUCCESS]",
      )} ${msg}`,
    );
  },
};
