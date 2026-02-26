import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRegisterMutation } from "@/hooks/useAuth";
import { tnDistricts } from "@/lib/mockData";

const schema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  district: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const register_ = useRegisterMutation();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    register_.mutate(
      { name: values.name, email: values.email, password: values.password, district: values.district },
      {
        onSuccess: () => navigate("/dashboard", { replace: true }),
        onError: (err) => {
          toast({
            title: "Registration failed",
            description: (err as Error).message ?? "Could not create account",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-2xl font-bold">
              FIXIT<span className="text-accent">NOW</span>
            </span>
          </Link>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3" /> Civic Issue Reporting — Tamil Nadu
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join Fix It Now to report civic issues in your area</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="Arjun Ravi"
                className="mt-1.5 bg-background"
                {...register("name")}
                disabled={register_.isPending}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="arjun@example.com"
                className="mt-1.5 bg-background"
                {...register("email")}
                disabled={register_.isPending}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                className="mt-1.5 bg-background"
                {...register("password")}
                disabled={register_.isPending}
              />
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Label className="text-sm font-medium">District (Optional)</Label>
              <Select onValueChange={(v) => setValue("district", v)} disabled={register_.isPending}>
                <SelectTrigger className="mt-1.5 bg-background">
                  <SelectValue placeholder="Select your district" />
                </SelectTrigger>
                <SelectContent className="bg-card max-h-60">
                  {tnDistricts.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={register_.isPending}>
              {register_.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
