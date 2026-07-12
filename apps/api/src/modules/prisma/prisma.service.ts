import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@finai/database";

const globalForPrisma = globalThis as unknown as { prismaClient: PrismaClient };

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client: PrismaClient = globalForPrisma.prismaClient || new PrismaClient();

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaClient = this.client;
    }
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
