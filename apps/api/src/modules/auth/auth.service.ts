import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { WorkspaceType, WorkspaceRole } from "@finai/database";
import { LoginInput, RegisterInput } from "@finai/validation";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(input: LoginInput) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async register(input: RegisterInput) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.client.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    });

    // Create default personal workspace for the user
    const workspace = await this.prisma.client.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        type: WorkspaceType.PERSONAL,
        ownerId: user.id,
      },
    });

    // Add user as OWNER member of the workspace
    await this.prisma.client.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: WorkspaceRole.OWNER,
      },
    });

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
