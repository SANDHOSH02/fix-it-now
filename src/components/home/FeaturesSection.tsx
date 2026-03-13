import { 
  Brain, 
  Copy, 
  MapPin, 
  Gauge, 
  Clock, 
  BarChart3 
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Issue Detection",
    description: "Smart algorithms automatically categorize and validate reported issues for faster processing.",
  },
  {
    icon: Copy,
    title: "Duplicate Detection",
    description: "AI identifies and merges duplicate complaints to prevent redundant work and track trends.",
  },
  {
    icon: MapPin,
    title: "Auto Geo-Location",
    description: "Automatically capture precise location data when reporting issues for accurate mapping.",
  },
  {
    icon: Gauge,
    title: "Priority Scoring",
    description: "Machine learning assigns priority scores based on urgency, impact, and community input.",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Track your reported issues in real-time with status updates and notifications.",
  },
  {
    icon: BarChart3,
    title: "Heatmap Analytics",
    description: "Visual analytics showing issue clusters to help authorities allocate resources effectively.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            AI-Powered Civic Management
          </h2>
          <p className="text-lg text-muted-foreground">
            Leverage cutting-edge technology to streamline issue reporting and resolution for smarter city governance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-civic-hover group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
                <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
