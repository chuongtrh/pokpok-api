import { Application, gzip, isHttpError, oakCors } from "../deps.ts";

import routers from "./routes/index.ts";

import { Logger } from "./middleware/logger.middleware.ts";
import { Timing } from "./middleware/timing.middleware.ts";

const app = new Application();

app.use(gzip());
app.use(oakCors());

app.use(Logger);
app.use(Timing);

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      ctx.response.status = err.status;
      ctx.response.body = { message: err.message };
    } else {
      console.error(ctx.request.url, err);
      ctx.response.status = 500;
      ctx.response.body = { message: err.message };
    }
  }
});

app.use(routers.routes());
app.use(routers.allowedMethods());

// Health check
app.use((ctx) => {
  ctx.response.body = "Pokpok app running...";
});

export default app;
