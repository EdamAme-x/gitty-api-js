# gitty-api-js
Gitty API Client for JavScript

## Installation
```llvm
npx jsr add @evex/gitty-api-js
deno add jsr:@evex/gitty-api-js
```

You need to extract cookies. (/`sb-[a-z]+-auth-token\.[\d]/` is important.)

## Usage
```ts
import { createClient } from "@evex/gitty-api-js";

const cookies = "sb-xxxxxxxx-auth-token.0=...; sb-xxxxxxxx-auth-token.1=...; ...";
const client = createClient(fetch, cookies);

const response = await client.user.getUserScoreAndRepo({
    "json": {
      "githubId": "EdamAme-x",
    },
  }, "POST");
const data = await response.json();
console.log(data);
```
