import { TransactionsPage } from "@/features/transactions/components";
import { transactions } from "@/lib/mock-data";

export default async function Page() {
  return <TransactionsPage transactions={transactions} />;
}
