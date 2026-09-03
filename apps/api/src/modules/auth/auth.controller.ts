import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { AuthService } from "@/modules/auth/auth.service";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@finai/validation";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  @ApiOperation({ summary: "Login with email and password" })
  login(@Body() body: LoginInput) {
    return this.authService.login(body);
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(registerSchema))
  @ApiOperation({ summary: "Register a new user" })
  register(@Body() body: RegisterInput) {
    return this.authService.register(body);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  @ApiOperation({ summary: "Request a password reset token" })
  forgotPassword(@Body() body: ForgotPasswordInput) {
    return this.authService.forgotPassword(body.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  @ApiOperation({ summary: "Reset password using token" })
  resetPassword(@Body() body: ResetPasswordInput) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
