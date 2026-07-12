import { GoalsPage } from "@finai/features";
import { goals } from "@/lib/mock-data";

export default function Page() {
  return <GoalsPage goals={goals} />;
}
