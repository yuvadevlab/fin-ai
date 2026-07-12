import { TransactionsPage } from "@finai/features";
import { transactions } from "@/lib/mock-data";

export default async function Page() {
  return <TransactionsPage transactions={transactions} />;
}
