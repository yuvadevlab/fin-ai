import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { Logger } from "@yuva-devlab/logger";
import { updateProfileSchema, type UpdateProfileInput } from "@finai/validation";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile and preferences" })
  getProfile(@CurrentUser("id") userId: string) {
    this.logger.debug(`[GET /users/profile] Fetching profile for user ${userId.slice(0, 8)}`);
    return this.usersService.getProfile(userId);
  }

  @Patch("profile")
  @ApiOperation({ summary: "Update current user profile and preferences" })
  updateProfile(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileInput,
  ) {
    this.logger.info(`[PATCH /users/profile] Updating profile for user ${userId.slice(0, 8)}`);
    return this.usersService.updateProfile(userId, body);
  }
}
