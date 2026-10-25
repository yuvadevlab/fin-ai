import { Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { NotificationsService } from "./services/notifications.service";
import { Logger } from "@yuva-devlab/logger";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List recent notifications for the current user" })
  getNotifications(@CurrentUser("id") userId: string, @Query("limit") limit?: string) {
    const parsedLimit = limit ? Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50) : 20;
    this.logger.info(`[getNotifications] Listing notifications for user ${userId.slice(0, 8)}`);
    return this.notificationsService.getUserNotifications(userId, parsedLimit);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get count of unread notifications" })
  getUnreadCount(@CurrentUser("id") userId: string) {
    this.logger.info(`[getUnreadCount] Fetching unread count for user ${userId.slice(0, 8)}`);
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  markRead(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.info(
      `[markRead] Marking notification ${id.slice(0, 8)} as read for user ${userId.slice(0, 8)}`,
    );
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  markAllRead(@CurrentUser("id") userId: string) {
    this.logger.info(
      `[markAllRead] Marking all notifications as read for user ${userId.slice(0, 8)}`,
    );
    return this.notificationsService.markAllAsRead(userId);
  }
}
