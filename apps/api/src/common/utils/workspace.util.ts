import { PrismaClient, WorkspaceType } from "@finai/database";

/**
 * Resolves all member user IDs for a given workspace.
 * If workspace is SHARED, returns [ownerId, ...memberUserIds].
 * If PERSONAL or missing, returns [fallbackUserId].
 */
export async function resolveWorkspaceMemberIds(
  prisma: { workspace: PrismaClient["workspace"] },
  workspaceId?: string,
  fallbackUserId?: string,
): Promise<string[]> {
  const fallback = fallbackUserId ? [fallbackUserId] : [];
  if (!workspaceId) return fallback;

  try {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { select: { userId: true } } },
    });

    if (!ws) return fallback;
    if (ws.type !== WorkspaceType.SHARED) {
      return [ws.ownerId || fallbackUserId].filter(Boolean) as string[];
    }

    const ids = new Set<string>();
    if (ws.ownerId) ids.add(ws.ownerId);
    ws.members.forEach((m) => {
      if (m.userId) ids.add(m.userId);
    });
    if (fallbackUserId) ids.add(fallbackUserId);

    return Array.from(ids);
  } catch {
    return fallback;
  }
}
