import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class AppController {
  @Get("health")
  @ApiOperation({ summary: "System health check endpoint" })
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "finai-api",
    };
  }
}
