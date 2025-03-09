import { trySync } from "@epicenterhq/result";

export const parseJson = (value: string) =>
  trySync({
    try: () => JSON.parse(value) as unknown,
    mapErr: (error) => ({ ok: false, _tag: "ParseJsonError", error }),
  });

// implement a debounce function
export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  wait: number
): ((...args: T) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};
