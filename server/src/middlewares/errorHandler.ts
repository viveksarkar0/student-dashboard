import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const statusCode = (error.statusCode as number) || 500;
  const message = error.message || "Internal Server Error";
  reply.code(statusCode).send({ message });
}
  