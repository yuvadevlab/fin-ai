import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Custom decorator to extract the active workspace context or workspaceId from the request.
 * @param property Optional property name (e.g. 'id', 'role', 'isReadOnly') to extract.
 * @returns The workspace object or requested property (defaults to workspace.id).
 */
export const CurrentWorkspace = createParamDecorator(
  (property: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const workspace = request.workspace;
    if (!property) {
      return request.workspaceId || workspace?.id;
    }
    if (property === "id") {
      return request.workspaceId || workspace?.id;
    }
    if (property === "role") {
      return request.workspaceRole || workspace?.role;
    }
    if (property === "isReadOnly") {
      return request.isWorkspaceReadOnly ?? false;
    }
    return workspace?.[property];
  },
);
