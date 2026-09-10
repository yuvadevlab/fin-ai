import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { prisma } from "@finai/database";

/**
 * NestJS wrapper around the shared Prisma client from `@finai/database`.
 *
 * `onModuleInit` connects the connection pool when the NestJS app starts,
 * and `onModuleDestroy` disconnects it gracefully on shutdown. All domain
 * services access Prisma through this service's `client` property rather
 * than importing `prisma` directly — this centralises lifecycle management.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client = prisma;

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
