import type { FastifyInstance } from "fastify";
import authRoutes from "./v1/authRoutes";
import userRoutes from "./v1/userRoutes";
import dashboardRoutes from "./v1/dashboardRoutes";

export default async function routes(server: FastifyInstance) {
  server.register(authRoutes, { prefix: "/v1/auth" });
  server.register(userRoutes, { prefix: "/v1/users" });
  server.register(dashboardRoutes, { prefix: "/v1/dashboard" });
}
