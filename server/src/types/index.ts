import '@fastify/jwt';
import 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email?: string; role?: string };
    user: { sub: string; email?: string; role?: string };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
    authorize: (roles: string[]) => any;
  }
}
