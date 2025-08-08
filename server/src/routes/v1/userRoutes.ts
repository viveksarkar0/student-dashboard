import type { FastifyInstance } from "fastify";
import userController from "../../controllers/v1/userController";
import path from "path";
import fs from "fs";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import userService from "../../services/userService";
import { pipeline } from "stream/promises";

export default async function userRoutes(server: FastifyInstance) {
  // Register multipart for file uploads (once)
  if (!(server as any).hasMultipart) {
    await server.register(multipart);
    (server as any).hasMultipart = true;
  }

  // Serve uploaded avatars statically
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  if (!(server as any).hasStatic) {
    await server.register(fastifyStatic, { root: uploadDir, prefix: "/uploads/" });
    (server as any).hasStatic = true;
  }

  server.get("/me", { preValidation: [server.authenticate] }, userController.getMe);
  server.put("/me", { preValidation: [server.authenticate] }, userController.updateMe);
  server.get("/admin/users", { preValidation: [server.authorize(["admin"]) ] }, userController.listUsersAdmin);

  server.post("/me/avatar", { preValidation: [server.authenticate] }, async (request, reply) => {
    const parts = (request as any).parts();
    for await (const part of parts) {
      if (part.file && part.fieldname === "avatar") {
        const ext = path.extname(part.filename || "").toLowerCase();
        const allowed = [".png", ".jpg", ".jpeg", ".webp"];
        if (!allowed.includes(ext)) return reply.code(400).send({ message: "Invalid file type" });
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const filepath = path.join(uploadDir, filename);
        await pipeline(part.file, fs.createWriteStream(filepath));
        const url = `/uploads/${filename}`;
        // request.user is normalized in authenticate hook to shape { id, email, role }
        const userId = (request.user as any).id as string;
        const user = await userService.updateUser(userId, { avatar: url });
        return reply.send({ message: "Avatar uploaded", url, user });
      }
    }
    return reply.code(400).send({ message: "No avatar provided" });
  });

  // Admin: paginated users list
  server.get("/", { preValidation: [server.authorize(["admin"]) ] }, async (request, reply) => {
    const q = (request.query as any) || {};
    const page = Number(q.page || 1);
    const limit = Number(q.limit || 10);
    const role = q.role as string | undefined;
    const keyword = q.q as string | undefined;
    const data = await userService.listUsersPaginated({ page, limit, role, q: keyword });
    return reply.send(data);
  });

  // Admin: update role/status
  server.patch("/:id", { preValidation: [server.authorize(["admin"]) ] }, async (request, reply) => {
    const id = (request.params as any).id as string;
    const body = (request.body as any) || {};
    const user = await userService.updateUserRoleStatus(id, { role: body.role, status: body.status });
    return reply.send({ user });
  });
}
