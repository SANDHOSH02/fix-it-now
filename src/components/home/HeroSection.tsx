import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArchitectureDiagram } from "./ArchitectureDiagram";

export function HeroSection() {
  return (
    <section className="relative border-b border-border overflow-hidden">
      {/* Blurred civic background image */}
      <div className="absolute inset-0">
        <img
          src="/background.png"
          alt=""
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-white/50" />
      </div>

      <div className="relative container py-14 lg:py-20">
        {/* Simple heading + buttons */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Fix It Now
          </h1>
          <p className="text-muted-foreground mb-6">
            Report civic issues. Track progress. Build better cities.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/report">
                Report Issue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/map">
                <MapPin className="h-3.5 w-3.5" /> View Map
              </Link>
            </Button>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="max-w-3xl mx-auto">
          <ArchitectureDiagram />
        </div>
      </div>
    </section>
  );
}
