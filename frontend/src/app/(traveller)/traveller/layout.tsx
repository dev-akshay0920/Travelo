import { TravellerShell } from "@/features/traveller/components/traveller-shell";

export default function TravellerLayout({ children }: { children: React.ReactNode }) {
  return <TravellerShell>{children}</TravellerShell>;
}
