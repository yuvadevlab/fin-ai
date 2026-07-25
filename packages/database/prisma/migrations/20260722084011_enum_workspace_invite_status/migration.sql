/*
  Warnings:

  - The `status` column on the `workspace_invites` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WorkspaceInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "workspace_invites" DROP COLUMN "status",
ADD COLUMN     "status" "WorkspaceInviteStatus" NOT NULL DEFAULT 'PENDING';
