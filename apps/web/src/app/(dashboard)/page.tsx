import { DashboardPage } from "@finai/features";
import { categoryBreakdown, monthlyCashFlow, savingsTrend } from "@/lib/mock-data";

export default async function Page() {
  return (
    <DashboardPage
      categoryBreakdown={categoryBreakdown}
      monthlyCashFlow={monthlyCashFlow}
      savingsTrend={savingsTrend}
    />
  );
}
