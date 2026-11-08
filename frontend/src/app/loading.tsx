import { LoadingState } from "@/components/shared/loading-state";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
      <LoadingState />
    </div>
  );
}
