import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { Notification, NotificationType, Prisma } from "@finai/database";
import { Logger } from "@yuva-devlab/logger";

@Injectable()
export class NotificationsRepository {
  private readonly logger = new Logger(NotificationsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    return this.prisma.client.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findUnreadCount(userId: string): Promise<number> {
    return this.prisma.client.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.client.notification.findUnique({
      where: { id },
    });
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Prisma.InputJsonValue;
  }): Promise<Notification> {
    return this.prisma.client.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data,
      },
    });
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    return this.prisma.client.notification.update({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.prisma.client.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return result.count;
  }
}
