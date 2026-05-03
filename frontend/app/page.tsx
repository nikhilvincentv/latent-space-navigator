import { NavigatorShell } from "@/components/NavigatorShell";
import { loadSamplePoints } from "@/lib/loadPoints";

export default async function Home() {
  const points = await loadSamplePoints();
  return <NavigatorShell points={points} />;
}
