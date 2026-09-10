-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'GOAL';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "goal_id" TEXT,
ADD COLUMN     "investment_id" TEXT;

-- CreateIndex
CREATE INDEX "transactions_investment_id_idx" ON "transactions"("investment_id");

-- CreateIndex
CREATE INDEX "transactions_goal_id_idx" ON "transactions"("goal_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
