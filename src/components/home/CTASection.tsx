import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Make Your City Better?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join thousands of citizens actively improving their communities. 
              Report issues, track progress, and see real change happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/report">
                  Start Reporting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
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
