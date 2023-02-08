import "https://deno.land/std@0.175.0/dotenv/load.ts";

const PORT = parseInt(Deno.env.get("PORT") || "5200");

import "./src/db/firestore.ts";

import app from "./src/app.ts";

await app.listen({ port: PORT });
