export default {
  PORT: parseInt(Deno.env.get("PORT") || "5200"),
  FIREBASE_CONFIG: Deno.env.get("FIREBASE_CONFIG") || "",
  JWT_SECRET: Deno.env.get("JWT_SECRET") || "",
  TELEGRAM_BOT_ID: Deno.env.get("TELEGRAM_BOT_ID") || "",
  WEB_APP_URL: Deno.env.get("WEB_APP_URL") || "",
};
