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

type Method = "GET" | "POST";

type ClientCall = (
  operationPath: OperationPath,
  input: Input,
  method?: Method,
  cookies?: string,
) => Promise<Response>;

type ClientProxyCall = (
  input: Input,
  method?: Method,
  cookies?: string,
) => Promise<Response>;

export type Client = ClientCall & {
  [key: string]: ClientProxy;
};

type ClientProxy = ClientProxyCall & {
  [key: string]: ClientProxy;
};

const API_URL = "https://gitty-code.com";

export const createClient = (
  defaultCookies: string | undefined,
  fetcher: Fetcher = fetch,
) : Client => {
  const execute = (
    operationPath: OperationPath,
    input: Input,
    method: Method = "GET",
    cookies: string | undefined = defaultCookies,
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

  const createProxy = (parts: string[] = []): ClientProxy => {
    const target = (() => {}) as unknown as ClientProxy;
    return new Proxy(target, {
      get: (_target, prop) => {
        if (prop === "then" || typeof prop === "symbol") {
          return undefined;
        }
        return createProxy([...parts, String(prop)]);
      },
      apply: (_target, _thisArg, args) => {
        if (parts.length === 0) {
          const [
            operationPath,
            input,
            method = "GET",
            cookies = defaultCookies,
          ] = args as [
            OperationPath,
            Input,
            Method | undefined,
            string | undefined,
          ];
          return execute(operationPath, input, method, cookies);
        }
        const [input, method = "GET", cookies = defaultCookies] = args as [
          Input,
          Method | undefined,
          string | undefined,
        ];
        return execute(parts.join(".") as OperationPath, input, method, cookies);
      },
    });
  };

  return createProxy() as unknown as Client;
};
