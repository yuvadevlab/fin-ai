import { healthMetrics } from "@/lib/mock-data";
import { HealthPage } from "@/features/health/components";

export default function Page() {
  return <HealthPage healthMetrics={healthMetrics} />;
}
