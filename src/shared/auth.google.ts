import { Buffer } from "https://deno.land/std@0.139.0/node/buffer.ts";

export const getProfileFromCredential = (credential: string) => {
  const tokens = credential.split(".");
  const atob = (base64: string) => {
    return Buffer.from(base64, "base64").toString("binary");
  };
  const payload = JSON.parse(atob(tokens[1]));
  return payload;
};
