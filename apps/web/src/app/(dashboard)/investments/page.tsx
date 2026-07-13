import { InvestmentsPage } from "@/features/investments/components";
import { investments, savingsTrend } from "@/lib/mock-data";

export default function Page() {
  return <InvestmentsPage investments={investments} savingsTrend={savingsTrend} />;
}
