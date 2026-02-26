import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-city.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Content */}
      <div className="relative container py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-primary-foreground text-sm">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
              AI-Powered Civic Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-balance">
              Report Civic Issues.{" "}
              <span className="text-accent">Fix Cities Faster.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto lg:mx-0">
              AI-powered civic complaint reporting and resolution platform. 
              Empowering citizens to build better cities, one report at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/report">
                  Report Issue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="xl">
                <Link to="/map">
                  <MapPin className="mr-2 h-5 w-5" />
                  View Issues Map
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-primary-foreground">12,847+</p>
                <p className="text-sm text-primary-foreground/70">Issues Reported</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-primary-foreground">94%</p>
                <p className="text-sm text-primary-foreground/70">Resolution Rate</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-primary-foreground">48 hrs</p>
                <p className="text-sm text-primary-foreground/70">Avg Response Time</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-in-right hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={heroImage}
                alt="Smart city civic reporting illustration"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -left-6 top-1/4 bg-card p-4 rounded-xl shadow-elevated animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-success text-lg">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Issue Resolved</p>
                  <p className="text-xs text-muted-foreground">Pothole - Main St.</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/4 bg-card p-4 rounded-xl shadow-elevated animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                  <span className="text-info text-lg">⚡</span>
                </div>
                <div>
                  <p className="text-sm font-medium">AI Detected</p>
                  <p className="text-xs text-muted-foreground">Duplicate merged</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
}
