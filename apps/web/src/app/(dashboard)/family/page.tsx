import { FamilyPage } from "@/features/family/components";
import { categoryBreakdown, monthlyCashFlow, savingsTrend } from "@/lib/mock-data";

export default function Page() {
  return (
    <FamilyPage
      categoryBreakdown={categoryBreakdown}
      monthlyCashFlow={monthlyCashFlow}
      savingsTrend={savingsTrend}
    />
  );
}
