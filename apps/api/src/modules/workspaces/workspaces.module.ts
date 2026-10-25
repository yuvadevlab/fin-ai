import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { NotificationsModule } from "@/modules/notifications/notifications.module";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesMembersController } from "./workspaces-members.controller";
import { WorkspacesInvitationsController } from "./workspaces-invitations.controller";
import { WorkspacesService } from "./services/workspaces.service";
import { WorkspacesMembersService } from "./services/workspaces-members.service";
import { WorkspacesInvitationsService } from "./services/workspaces-invitations.service";
import { WorkspacesRepository } from "./repositories/workspaces.repository";
import { WorkspacesMembersRepository } from "./repositories/workspaces-members.repository";
import { WorkspacesInvitationsRepository } from "./repositories/workspaces-invitations.repository";
import { WorkspaceGuard } from "@/common/guards/workspace.guard";

@Global()
@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [WorkspacesController, WorkspacesMembersController, WorkspacesInvitationsController],
  providers: [
    WorkspacesService,
    WorkspacesMembersService,
    WorkspacesInvitationsService,
    WorkspacesRepository,
    WorkspacesMembersRepository,
    WorkspacesInvitationsRepository,
    WorkspaceGuard,
  ],
  exports: [
    WorkspacesService,
    WorkspacesMembersService,
    WorkspacesInvitationsService,
    WorkspacesRepository,
    WorkspacesMembersRepository,
    WorkspacesInvitationsRepository,
    WorkspaceGuard,
  ],
})
export class WorkspacesModule {}
