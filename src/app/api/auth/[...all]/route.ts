import { accountServices } from "@/server/auth";

async function handler(request: Request) {
  const services = accountServices();
  if (!services) return Response.json({ message: "Akun belum diaktifkan." }, { status: 503 });
  return services.auth.handler(request);
}

export { handler as GET, handler as POST };
