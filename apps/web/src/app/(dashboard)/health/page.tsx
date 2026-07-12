import { healthMetrics } from "@/lib/mock-data";
import { HealthPage } from "@finai/features";

export default function Page() {
  <HealthPage healthMetrics={healthMetrics} />;
}
