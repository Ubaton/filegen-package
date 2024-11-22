import { Card } from "@/components/ui/card";
import { Database } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];

interface QueueDisplayProps {
  appointments: Appointment[];
  loading: boolean;
}

export function QueueDisplay({ appointments, loading }: QueueDisplayProps) {
  if (loading) {
    return <Skeleton className="h-48" />;
  }

  const currentAppointment = appointments[0];
  const upcomingAppointments = appointments.slice(1, 4);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Current Queue</h2>
      
      <div className="space-y-6">
        {currentAppointment && (
          <div className="border-b pb-4">
            <p className="text-sm text-muted-foreground">Now Serving</p>
            <p className="text-2xl font-bold">#{currentAppointment.queue_number}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="text-center">
              <p className="text-sm text-muted-foreground">Coming Up</p>
              <p className="text-xl font-semibold">#{appointment.queue_number}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}