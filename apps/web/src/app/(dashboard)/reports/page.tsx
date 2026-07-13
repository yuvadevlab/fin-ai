import { ReportsPage } from "@/features/reports/components";
import { categoryBreakdown, monthlyCashFlow } from "@/lib/mock-data";

export default function Page() {
  return <ReportsPage categoryBreakdown={categoryBreakdown} monthlyCashFlow={monthlyCashFlow} />;
}
