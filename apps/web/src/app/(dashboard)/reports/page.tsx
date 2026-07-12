import { ReportsPage } from "@finai/features";
import { categoryBreakdown, monthlyCashFlow } from "@/lib/mock-data";

export default function Page() {
  return <ReportsPage categoryBreakdown={categoryBreakdown} monthlyCashFlow={monthlyCashFlow} />;
}
