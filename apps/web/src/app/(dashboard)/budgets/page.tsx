import { BudgetsPage } from "@/features/budgets/components";
import { budgets } from "@/lib/mock-data";

export default function Page() {
  return <BudgetsPage budgets={budgets} />;
}
