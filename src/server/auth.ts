import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import * as schema from "./schema";

let services: ReturnType<typeof createServices> | undefined;

function createServices(databaseUrl: string, baseURL: string, secret: string, smtpHost: string, smtpPort: number, from: string) {
  const pool = new Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 3000 });
  const db = drizzle(pool, { schema });
  const mail = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: false, socketTimeout: 5000 });

  async function sendLink(to: string, subject: string, url: string) {
    await mail.sendMail({ from, to, subject, text: subject + "\n\n" + url });
  }

  const auth = betterAuth({
    appName: "StyleFit AI",
    baseURL,
    secret,
    database: drizzleAdapter(db, { provider: "pg", schema }),
    rateLimit: { enabled: true },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendLink(user.email, "Atur ulang kata sandi StyleFit", url);
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendLink(user.email, "Verifikasi akun StyleFit", url);
      },
    },
  });
  return { auth, db };
}

// shortcut: account testing uses loopback SMTP and web only. Configure public email delivery before enabling public accounts.
export function accountServices() {
  if (process.env.AUTH_ENABLED !== "true") return null;
  const { DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, SMTP_HOST, SMTP_PORT, SMTP_FROM } = process.env;
  const port = Number(SMTP_PORT);
  if (!DATABASE_URL || !BETTER_AUTH_URL || !BETTER_AUTH_SECRET || BETTER_AUTH_SECRET.length < 32
    || !SMTP_HOST || !SMTP_FROM || !Number.isInteger(port) || port < 1 || port > 65535) return null;

  try {
    const origin = new URL(BETTER_AUTH_URL);
    const database = new URL(DATABASE_URL);
    const loopback = ["localhost", "127.0.0.1", "[::1]"];
    if (origin.protocol !== "http:" || !loopback.includes(origin.hostname) || origin.origin !== BETTER_AUTH_URL
      || !["postgres:", "postgresql:"].includes(database.protocol) || !loopback.includes(database.hostname)
      || !loopback.includes(SMTP_HOST)) return null;
  } catch {
    return null;
  }
  services ??= createServices(DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, SMTP_HOST, port, SMTP_FROM);
  return services;
}
