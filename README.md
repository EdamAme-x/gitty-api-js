# gitty-api-js
Gitty API Client for JavaScript

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
const client = createClient(cookies);

const response = await client.user.getUserScoreAndRepo({
    "json": {
      "githubId": "EdamAme-x",
    },
  }, "POST");
const data = await response.json();
console.log(data);
```

From here, I can confirm the operation name and input.

<img width="224" height="250" alt="image" src="https://github.com/user-attachments/assets/aefc0e21-197b-4c9f-8d28-0a5bd2b1198c" />
