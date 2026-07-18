import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.menuItem.findMany({
      orderBy: { order: "asc" },
    });
  }
}
