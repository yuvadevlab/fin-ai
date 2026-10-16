import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { config } from "@/config";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current authenticated user shadow profile" })
  getProfile(@Req() req: { user: unknown }) {
    return req.user;
  }

  @Get("sso-url")
  @ApiOperation({ summary: "Get centralized DevLab Portal SSO login URL" })
  getSsoUrl() {
    const portalUrl = config.gatewayUrl || "http://localhost:3015";
    return {
      ssoUrl: `${portalUrl}/login?app=finai`,
      portalUrl,
    };
  }
}
