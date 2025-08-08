import type { FastifyReply, FastifyRequest } from "fastify";
import userService from "../../services/userService";

class UserController {
  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      // authenticate hook in index.ts sets request.user = { id, email, role }
      const userId = (request.user as any)?.id as string;
      const user = await userService.findById(userId);
      if (!user) return reply.code(404).send({ message: "User not found" });
      return reply.send({ user });
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async updateMe(
    request: FastifyRequest<{ Body: { firstName?: string; lastName?: string; avatar?: string; bio?: string } }>,
    reply: FastifyReply
  ) {
    try {
      // authenticate hook in index.ts sets request.user = { id, email, role }
      const userId = (request.user as any)?.id as string;
      const updates = request.body || {};
      const user = await userService.updateUser(userId, updates);
      return reply.send({ message: "Profile updated", user });
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }

  async listUsersAdmin(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.listUsers();
      return reply.send({ users });
    } catch (err: any) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }
}

export default new UserController();
