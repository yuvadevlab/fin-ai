import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
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
  private readonly logger = new Logger(PrismaService.name);
  readonly client = prisma;

  async onModuleInit(): Promise<void> {
    this.logger.log("Connecting to database...");
    await this.client.$connect();
    this.logger.log("Database connection established");
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Disconnecting from database...");
    await this.client.$disconnect();
    this.logger.log("Database connection closed");
  }
}
