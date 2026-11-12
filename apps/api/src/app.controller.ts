import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Logger } from "@yuva-devlab/logger";
import { API_VERSION, BUILD_METADATA } from "./version";

@ApiTags("Health")
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get(["health", "api/v1/health"])
  @ApiOperation({
    summary: "System health check endpoint (dual /health and /api/v1/health support)",
  })
  getHealth() {
    this.logger.info("[GET /health] Health check requested");
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "finai-api",
      version: API_VERSION,
      build: BUILD_METADATA,
      uptime: process.uptime(),
    };
  }
}
