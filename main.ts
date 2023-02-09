import "./deps.ts";

import config from "./src/shared/config.ts";

import "./src/db/firestore.ts";

import app from "./src/app.ts";

await app.listen({ port: config.PORT });
