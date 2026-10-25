import { PrismaService } from "@/modules/prisma/prisma.service";
import { UserPreferences } from "@finai/shared-types";
import { Prisma } from "@finai/database";
import { Logger } from "@yuva-devlab/logger";

const logger = new Logger("AccountPreferencesHelper");

export async function getDefaultAccountId(
  prisma: PrismaService,
  userId: string,
): Promise<string | null> {
  logger.info(`[getDefaultAccountId] Reading default account for user ${userId.slice(0, 8)}`);
  const user = await prisma.client.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  const prefs = (user?.preferences as unknown as UserPreferences) || {};
  return prefs.defaultAccountId ?? null;
}

export async function setDefaultAccountId(
  prisma: PrismaService,
  userId: string,
  accountId: string | null,
): Promise<void> {
  logger.info(
    `[setDefaultAccountId] Setting default for user ${userId.slice(0, 8)}: ${accountId ? accountId.slice(0, 8) : "clear"}`,
  );
  const user = await prisma.client.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  const current = (user?.preferences as unknown as UserPreferences) || {};
  const updated: UserPreferences = { ...current };
  if (accountId === null) {
    delete updated.defaultAccountId;
  } else {
    updated.defaultAccountId = accountId;
  }
  await prisma.client.user.update({
    where: { id: userId },
    data: { preferences: updated as unknown as Prisma.InputJsonValue },
  });
}
