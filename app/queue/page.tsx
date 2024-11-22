"use client";

import { useEffect } from "react";
import { useAppointments } from "@/lib/hooks/use-appointments";
import { QueueDisplay } from "@/components/queue/queue-display";
import { UserAppointment } from "@/components/queue/user-appointment";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function QueuePage() {
  const { appointments, loading, error } = useAppointments();

  useEffect(() => {
    // Subscribe to notifications for the user's appointment
    const subscription = supabase
      .channel('queue-updates')
      .on('broadcast', { event: 'queue-update' }, (payload) => {
        if (payload.appointment_id === /* user's appointment id */) {
          toast.info(payload.message);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Queue Status</h1>

        <div className="grid gap-6">
          <QueueDisplay appointments={appointments} loading={loading} />
          
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Appointment</h2>
            <UserAppointment />
          </Card>
        </div>
      </div>
    </div>
  );
}