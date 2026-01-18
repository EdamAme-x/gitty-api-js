import { createClient } from "@/trpc/create-client.ts";
import { assertEquals, assertExists } from "@std/assert";
import "@std/dotenv/load";

const cookies = Deno.env.get("GITTY_COOKIES");

if (!cookies) {
  throw new Error("'GITTY_COOKIES' is not set");
}

Deno.test("Integration tests", async () => {
  const client = createClient(cookies);
  const result = await client.user.getUserScoreAndRepo({
    "json": {
      "githubId": "EdamAme-x",
    },
  }, "POST");

  assertEquals(result.status, 200);
  const data = await result.json();
  assertExists(data[0].result.data.json);
});
