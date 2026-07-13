import { DashboardPage } from "@/features/dashboard/components";
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
