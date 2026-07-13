import { AccountsPage } from "@/features/accounts/components";
import { accounts } from "@/lib/mock-data";

export default async function Page() {
  return <AccountsPage accounts={accounts} />;
}
