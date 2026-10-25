import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationsRepository } from "../repositories/notifications.repository";
import { NotificationType, Prisma } from "@finai/database";
import { Logger } from "@yuva-devlab/logger";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async getUserNotifications(userId: string, limit = 20) {
    this.logger.info(
      `[getUserNotifications] Fetching notifications for user ${userId.slice(0, 8)}`,
    );
    return this.notificationsRepo.findUserNotifications(userId, limit);
  }

  async getUnreadCount(userId: string) {
    this.logger.info(
      `[getUnreadCount] Counting unread notifications for user ${userId.slice(0, 8)}`,
    );
    const count = await this.notificationsRepo.findUnreadCount(userId);
    return { count };
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Prisma.InputJsonValue;
  }) {
    this.logger.info(
      `[createNotification] Creating ${data.type} notification for user ${data.userId.slice(0, 8)}`,
    );
    return this.notificationsRepo.create(data);
  }

  async markAsRead(id: string, userId: string) {
    this.logger.info(
      `[markAsRead] Marking notification ${id.slice(0, 8)} as read for user ${userId.slice(0, 8)}`,
    );
    const notification = await this.notificationsRepo.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException("Notification not found");
    }
    return this.notificationsRepo.markRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    this.logger.info(
      `[markAllAsRead] Marking all notifications read for user ${userId.slice(0, 8)}`,
    );
    const count = await this.notificationsRepo.markAllRead(userId);
    return { count };
  }
}
