import {
  Application,
  isHttpError,
  Status,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { gzip } from "https://deno.land/x/oak_compress@v0.0.2/mod.ts";
import routers from "./routes/index.ts";

const app = new Application();

app.use(gzip());
app.use(oakCors()); // Enable CORS for All Routes

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(
    `${ctx.request.method} ${ctx.request.url}- ${ctx.response.status} - ${rt}`,
  );
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      switch (err.status) {
        case Status.NotFound:
          // handle NotFound
          break;
        default:
          // handle other statuses
      }
    } else {
      // rethrow if you can't handle the error
      console.error(ctx.request.url, err);
      throw err;
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
