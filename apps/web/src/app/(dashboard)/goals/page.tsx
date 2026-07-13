import { GoalsPage } from "@/features/goals/components";
import { goals } from "@/lib/mock-data";

export default function Page() {
  return <GoalsPage goals={goals} />;
}
