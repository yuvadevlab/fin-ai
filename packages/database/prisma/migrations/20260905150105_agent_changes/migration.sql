-- CreateEnum
CREATE TYPE "AgentActionStatus" AS ENUM ('PROPOSED', 'EXECUTED', 'REJECTED', 'EXPIRED', 'FAILED');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "last_entity_ref" JSONB,
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "agent_actions" (
    "id" TEXT NOT NULL,
    "client_action_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "preview" JSONB,
    "status" "AgentActionStatus" NOT NULL DEFAULT 'PROPOSED',
    "result" JSONB,
    "error" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "run_id" TEXT,
    "action" TEXT NOT NULL,
    "tool" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "before" JSONB,
    "after" JSONB,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_actions_client_action_id_key" ON "agent_actions"("client_action_id");

-- CreateIndex
CREATE INDEX "agent_actions_user_id_status_idx" ON "agent_actions"("user_id", "status");

-- CreateIndex
CREATE INDEX "agent_actions_conversation_id_idx" ON "agent_actions"("conversation_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_tool_created_at_idx" ON "audit_logs"("tool", "created_at");

-- AddForeignKey
ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
