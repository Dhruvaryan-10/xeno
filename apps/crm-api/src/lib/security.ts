import { createHmac, timingSafeEqual } from "node:crypto";

export function sign(body: string | Buffer, secret: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifySignature(body: string | Buffer, signature: string | undefined, secret: string) {
  return Boolean(signature) && safeEqual(sign(body, secret), signature!);
}
