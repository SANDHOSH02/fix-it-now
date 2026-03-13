// ─── Tamil Nadu Civic Complaint Mock Data ────────────────────────────────────
// All coordinates are real Tamil Nadu city/street locations.

export type IssueCategory =
  | "roads"
  | "water"
  | "garbage"
  | "lighting"
  | "drainage"
  | "other";

export type IssueStatus =
  | "reported"
  | "pending"
  | "assigned"
  | "in-progress"
  | "resolved";

export type IssuePriority = "low" | "medium" | "high";

export interface Complaint {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    district: string;
  };
  reporter: {
    name: string;
    email: string;
    userId: string;
  };
  department: string | null;
  aiConfidence: number; // 0-100
  isDuplicate: boolean;
  dateISO: string;
  date: string;
  upvotes: number;
  statusHistory: { status: IssueStatus; date: string; note: string }[];
}

export const complaints: Complaint[] = [
  // No static data — all data is loaded from the API
];

// Convenience helper: get complaints for one user
export function getComplaintsForUser(userId: string): Complaint[] {
  return complaints.filter((c) => c.reporter.userId === userId);
}

// Tamil Nadu districts list for dropdown
export const tnDistricts = [
  "Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli",
  "Tirunelveli", "Vellore", "Erode", "Tiruppur", "Thanjavur",
  "Kanchipuram", "Dindigul", "Cuddalore", "Nagapattinam",
  "Ramanathapuram", "Thoothukudi", "Kanyakumari", "Nilgiris",
  "Dharmapuri", "Krishnagiri", "Villupuram", "Virudhunagar",
  "Pudukkottai", "Sivaganga", "Ariyalur", "Perambalur",
];

export const departments = [
  "Roads Dept.",
  "CMWSSB",
  "TWAD Board",
  "Electrical Dept.",
  "Sanitation",
  "Public Works",
  "Parks & Recreation",
  "Urban Development",
];

// AI categories description
export const aiPipelineSteps = [
  { id: 1, label: "Parsing natural language description", duration: 600 },
  { id: 2, label: "Auto-classifying issue category", duration: 500 },
  { id: 3, label: "Checking for duplicates within 500m radius", duration: 700 },
  { id: 4, label: "Computing AI priority score", duration: 400 },
  { id: 5, label: "Routing to relevant department", duration: 300 },
];
