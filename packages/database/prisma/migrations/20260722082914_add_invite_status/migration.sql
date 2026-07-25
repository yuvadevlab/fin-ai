-- AlterTable
ALTER TABLE "workspace_invites" ADD COLUMN     "accepted_at" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
