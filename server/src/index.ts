import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import routes from "./routes/index";
import path from "path";
import fs from "fs";
import fastifyStatic from "@fastify/static";
import { connectDB } from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";

const server = Fastify({ logger: true });

// Register plugins
await server.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
      .split(",")
      .map((o) => o.trim());
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
});

await server.register(cookie);

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
await server.register(jwt, {
  secret: JWT_SECRET,
  cookie: {
    cookieName: process.env.COOKIE_NAME || "token",
    signed: false,
  },
});

// Decorate authenticate hook
server.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      // Add user info to request for easier access
      (request as any).user = {
        id: (request.user as any)?.sub,
        email: (request.user as any)?.email,
        role: (request.user as any)?.role,
      };
    } catch (err) {
      reply.code(401).send({ message: "Unauthorized" });
    }
  }
);

// Decorate authorize hook for RBAC
server.decorate(
  "authorize",
  (roles: string[]) => async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as any;
      if (roles.length && !roles.includes(payload?.role)) {
        return reply.code(403).send({ message: "Forbidden" });
      }
    } catch {
      return reply.code(401).send({ message: "Unauthorized" });
    }
  }
);

// DB
await connectDB();

// Static uploads (serve at top-level /uploads/*)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
await server.register(fastifyStatic, { root: uploadDir, prefix: "/uploads/" });

// Health route
server.get("/", async () => ({ status: "ok" }));

// Routes
await server.register(routes);

// 404 handler
server.setNotFoundHandler((_, reply) => {
  reply.code(404).send({ message: "API endpoint not found. Please check the URL." });
});

// Error handler
server.setErrorHandler(errorHandler);

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "0.0.0.0";

server
  .listen({ port: PORT, host: HOST })
  .then((address) => {
    server.log.info(`🚀 Server running at ${address}`);
  })
  .catch((error) => {
    server.log.error(error, "❌ Error starting server");
    process.exit(1);
  });
