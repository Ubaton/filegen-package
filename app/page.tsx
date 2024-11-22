import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scissors, Clock, Calendar, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          BarberQueue
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Your time matters. Book your perfect cut, track your queue, and get notified when it's your turn.
        </p>
        <Button size="lg" className="mr-4">
          Book Now
        </Button>
        <Button variant="outline" size="lg">
          View Queue
        </Button>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Scissors className="w-8 h-8" />}
            title="Expert Styling"
            description="Choose from our wide range of professional haircut styles"
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8" />}
            title="Real-time Queue"
            description="Track your position and get instant wait time updates"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Easy Booking"
            description="Book your appointment in seconds with our intuitive system"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Smart Notifications"
            description="Get notified when it's time to prepare for your cut"
          />
        </div>
      </section>

      {/* Current Queue Status */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4">Current Queue Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-muted-foreground">Current Number</p>
              <p className="text-4xl font-bold text-primary">23</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimated Wait Time</p>
              <p className="text-4xl font-bold text-primary">25 min</p>
            </div>
            <div>
              <p className="text-muted-foreground">People in Queue</p>
              <p className="text-4xl font-bold text-primary">7</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>© 2024 BarberQueue. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}