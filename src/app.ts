import {
  Application,
  isHttpError,
  Status,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { gzip } from "https://deno.land/x/oak_compress@v0.0.2/mod.ts";
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
