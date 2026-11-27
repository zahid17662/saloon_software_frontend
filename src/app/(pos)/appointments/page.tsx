import { AppointmentsView } from "@/components/appointments-view";
import { ShopGate } from "@/components/gates";

// Read-only appointments list for an unlocked shop device (barber or admin). Loads its data in the
// browser through a Server Action, so there is no server-rendered content to validate.
export const instant = false;

export default function Page() {
  return (
    <ShopGate>
      <AppointmentsView />
    </ShopGate>
  );
}
