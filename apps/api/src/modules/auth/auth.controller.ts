import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";

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
    const portalWebUrl = process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL || "http://localhost:3005";
    return {
      ssoUrl: `${portalWebUrl}/login?app=finai`,
      portalUrl: portalWebUrl,
    };
  }
}
