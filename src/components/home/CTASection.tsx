import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-16">
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Make Your City Better?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join citizens actively improving their communities.
              Report issues, track progress, and see real change happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                <Link to="/report">
                  Start Reporting
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-primary-foreground hover:bg-white/10">
                <Link to="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
