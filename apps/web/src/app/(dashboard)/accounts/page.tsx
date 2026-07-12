import { AccountsPage } from "@finai/features";
import { accounts } from "@/lib/mock-data";

export default async function Page() {
  return <AccountsPage accounts={accounts} />;
}
