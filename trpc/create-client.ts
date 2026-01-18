import type { LooseType } from "@evex/loose-types";

export interface Fetcher {
  (url: string, options: RequestInit): Promise<Response>;
}

type JsonablePropertyKey = Exclude<PropertyKey, symbol>;

export interface Input {
  json: Record<JsonablePropertyKey, LooseType> | null;
  meta?: {
    values: LooseType[];
  };
}

export type OperationPath = `${string}.${string}`;

const API_URL = "https://gitty-code.com";

export const createClient = (
  fetcher: Fetcher = fetch,
  defaultCookies: string | undefined,
) => {
  return (
    operationPath: OperationPath,
    cookies: string | undefined = defaultCookies,
    input: Input,
    method: "GET" | "POST" = "GET",
  ) => {
    const [group, op] = operationPath.split(".");

    if (!group || !op) {
      throw new Error(`Invalid operation path: ${operationPath}`);
    }

    if (!cookies) {
      throw new Error(`Cookies are required for operation: ${operationPath}`);
    }

    if (!input) {
      throw new Error(`Input is required for operation: ${operationPath}`);
    }

    let requestUrl = `${API_URL}/api/trpc/${group}.${op}?batch=1`;

    if (method === "GET") {
      requestUrl += `&input=${
        encodeURIComponent(JSON.stringify({ "0": input }))
      }`;
    }

    const requestInit: RequestInit = {
      "headers": {
        "accept": "*/*",
        "accept-language":
          "ja-JP,ja;q=0.9,ar-SS;q=0.8,ar;q=0.7,en-US;q=0.6,en;q=0.5,ko-KR;q=0.4,ko;q=0.3",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "x-trpc-source": "nextjs-react",
        "cookie": cookies,
        "Referer": API_URL,
      },
      "method": method,
    };

    if (method === "POST") {
      requestInit.headers = {
        ...requestInit.headers,
        "content-type": "application/json",
      };
    }

    if (method === "POST") {
      requestInit.body = JSON.stringify({ "0": input });
    }

    return fetcher(requestUrl, requestInit);
  };
};
