import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Logger } from "@finai/logger";

@ApiTags("Health")
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  @Get("health")
  @ApiOperation({ summary: "System health check endpoint" })
  getHealth() {
    this.logger.debug("[GET /health] Health check requested");
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "finai-api",
    };
  }
}
