import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">F</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                FIXIT<span className="text-accent">NOW</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              AI-powered civic complaint reporting and resolution platform. 
              Empowering citizens to build better cities together.
            </p>
            <p className="mt-4 text-sm font-medium text-primary">
              Smart Governance. Smarter Cities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/report" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Issues Map
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Track Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Information</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About FIXITNOW
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} FIXITNOW. All rights reserved. Building smarter cities through citizen engagement.
          </p>
        </div>
      </div>
    </footer>
  );
}
