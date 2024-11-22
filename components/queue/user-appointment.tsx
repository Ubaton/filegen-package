"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];

export function UserAppointment() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: appointmentData, error: appointmentError } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "confirmed")
          .single();

        if (appointmentError) throw appointmentError;
        setAppointment(appointmentData);

        if (appointmentData) {
          const { data: serviceData, error: serviceError } = await supabase
            .from("services")
            .select("*")
            .eq("id", appointmentData.service_id)
            .single();

          if (serviceError) throw serviceError;
          setService(serviceData);
        }
      } catch (error) {
        toast.error("Failed to load appointment details");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, []);

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin" />;
  }

  if (!appointment || !service) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No active appointments</p>
        <Button className="mt-4" href="/booking">
          Book Now
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{service.name}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(appointment.appointment_time), "MMMM d, h:mm a")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">#{appointment.queue_number}</p>
            <p className="text-sm text-muted-foreground">Your Number</p>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium">Estimated Wait Time</p>
          <p className="text-2xl font-bold">25 minutes</p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            We'll notify you 5 minutes before your turn. Please be ready!
          </p>
        </div>
      </div>
    </Card>
  );
}