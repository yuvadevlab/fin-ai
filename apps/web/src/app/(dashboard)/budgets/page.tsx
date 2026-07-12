import { BudgetsPage } from "@finai/features";
import { budgets } from "@/lib/mock-data";

export default function Page() {
  return <BudgetsPage budgets={budgets} />;
}
