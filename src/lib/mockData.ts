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
  {
    id: "FIX-2026-001",
    title: "Large pothole on Anna Salai near Gemini flyover",
    category: "roads",
    description:
      "A massive pothole has developed near the Gemini flyover on Anna Salai. Several two-wheelers have been damaged. The pothole is about 1.5 feet wide and 8 inches deep. Heavy rainfall has made it worse.",
    status: "in-progress",
    priority: "high",
    location: {
      lat: 13.0598,
      lng: 80.2478,
      address: "Anna Salai, near Gemini Flyover",
      city: "Chennai",
      district: "Chennai",
    },
    reporter: { name: "Arjun Ravi", email: "arjun@example.com", userId: "USR-001" },
    department: "Roads Dept.",
    aiConfidence: 97,
    isDuplicate: false,
    dateISO: "2026-02-24T09:15:00",
    date: "Feb 24, 2026",
    upvotes: 34,
    statusHistory: [
      { status: "reported", date: "Feb 24, 2026", note: "Complaint received" },
      { status: "pending", date: "Feb 24, 2026", note: "Under AI review" },
      { status: "assigned", date: "Feb 25, 2026", note: "Assigned to Roads Dept." },
      { status: "in-progress", date: "Feb 26, 2026", note: "Repair team dispatched" },
    ],
  },
  {
    id: "FIX-2026-002",
    title: "Water main burst near Nungambakkam High Road",
    category: "water",
    description:
      "A water main has burst near the signal at Nungambakkam High Road. Water is flooding the road and entering nearby shops. The leak has been going on for 6 hours.",
    status: "assigned",
    priority: "high",
    location: {
      lat: 13.0611,
      lng: 80.2535,
      address: "Nungambakkam High Road",
      city: "Chennai",
      district: "Chennai",
    },
    reporter: { name: "Priya Suresh", email: "priya@example.com", userId: "USR-002" },
    department: "CMWSSB",
    aiConfidence: 94,
    isDuplicate: false,
    dateISO: "2026-02-25T06:20:00",
    date: "Feb 25, 2026",
    upvotes: 22,
    statusHistory: [
      { status: "reported", date: "Feb 25, 2026", note: "Complaint received" },
      { status: "assigned", date: "Feb 25, 2026", note: "Assigned to CMWSSB" },
    ],
  },
  {
    id: "FIX-2026-003",
    title: "Street lights not working in T. Nagar 3rd avenue",
    category: "lighting",
    description:
      "All street lights from 3rd Avenue to 5th Avenue in T. Nagar have been non-functional for 4 days. The area is very dark at night and is a safety concern especially for women.",
    status: "resolved",
    priority: "medium",
    location: {
      lat: 13.0418,
      lng: 80.2341,
      address: "3rd Avenue, T. Nagar",
      city: "Chennai",
      district: "Chennai",
    },
    reporter: { name: "Kavitha Menon", email: "kavitha@example.com", userId: "USR-003" },
    department: "Electrical Dept.",
    aiConfidence: 91,
    isDuplicate: false,
    dateISO: "2026-02-20T19:30:00",
    date: "Feb 20, 2026",
    upvotes: 18,
    statusHistory: [
      { status: "reported", date: "Feb 20, 2026", note: "Complaint received" },
      { status: "in-progress", date: "Feb 21, 2026", note: "Electricians dispatched" },
      { status: "resolved", date: "Feb 23, 2026", note: "All lights repaired" },
    ],
  },
  {
    id: "FIX-2026-004",
    title: "Overflowing garbage bin near Gandhipuram bus stand",
    category: "garbage",
    description:
      "The garbage bin near Gandhipuram bus stand has been overflowing for 3 days. Waste is scattered on the footpath and vehicles are struggling to pass. Strong odour complaints from nearby restaurants.",
    status: "pending",
    priority: "medium",
    location: {
      lat: 11.0183,
      lng: 76.9622,
      address: "Gandhipuram Bus Stand",
      city: "Coimbatore",
      district: "Coimbatore",
    },
    reporter: { name: "Ravi Murugan", email: "ravi@example.com", userId: "USR-004" },
    department: null,
    aiConfidence: 96,
    isDuplicate: false,
    dateISO: "2026-02-23T11:45:00",
    date: "Feb 23, 2026",
    upvotes: 11,
    statusHistory: [
      { status: "reported", date: "Feb 23, 2026", note: "Complaint received" },
      { status: "pending", date: "Feb 23, 2026", note: "Awaiting department review" },
    ],
  },
  {
    id: "FIX-2026-005",
    title: "Drainage blocked causing waterlogging near Meenakshi Temple",
    category: "drainage",
    description:
      "Main drainage channel near Meenakshi Temple East Tower Gate is severely blocked. Even light rains cause 1-2 feet of water logging making the entrance inaccessible for devotees and disrupting traffic.",
    status: "in-progress",
    priority: "high",
    location: {
      lat: 9.9195,
      lng: 78.1193,
      address: "East Tower Gate Road, Meenakshi Temple",
      city: "Madurai",
      district: "Madurai",
    },
    reporter: { name: "Meera Pandian", email: "meera@example.com", userId: "USR-005" },
    department: "Public Works",
    aiConfidence: 88,
    isDuplicate: false,
    dateISO: "2026-02-22T14:00:00",
    date: "Feb 22, 2026",
    upvotes: 45,
    statusHistory: [
      { status: "reported", date: "Feb 22, 2026", note: "Complaint received" },
      { status: "assigned", date: "Feb 22, 2026", note: "Assigned to Public Works" },
      { status: "in-progress", date: "Feb 24, 2026", note: "Desilting work in progress" },
    ],
  },
  {
    id: "FIX-2026-006",
    title: "Road crack on MG Road near Salem junction",
    category: "roads",
    description:
      "Multiple longitudinal cracks have developed on MG Road near the main junction in Salem. Heavy vehicles passing over these cracks are widening them rapidly. Risk of road cave-in.",
    status: "reported",
    priority: "high",
    location: {
      lat: 11.6651,
      lng: 78.1464,
      address: "MG Road, Salem Junction",
      city: "Salem",
      district: "Salem",
    },
    reporter: { name: "Karthik Raja", email: "karthik@example.com", userId: "USR-006" },
    department: null,
    aiConfidence: 93,
    isDuplicate: false,
    dateISO: "2026-02-26T08:10:00",
    date: "Feb 26, 2026",
    upvotes: 7,
    statusHistory: [
      { status: "reported", date: "Feb 26, 2026", note: "Complaint received" },
    ],
  },
  {
    id: "FIX-2026-007",
    title: "No water supply for 5 days in Trichy Woraiyur",
    category: "water",
    description:
      "Residents of Woraiyur locality in Trichy have not received piped water supply for 5 consecutive days. The TWAD board pipeline serving about 200 houses appears to have a major fault.",
    status: "assigned",
    priority: "high",
    location: {
      lat: 10.8108,
      lng: 78.7350,
      address: "Woraiyur Main Road",
      city: "Tiruchirappalli",
      district: "Tiruchirappalli",
    },
    reporter: { name: "Senthil Kumar", email: "senthil@example.com", userId: "USR-007" },
    department: "TWAD Board",
    aiConfidence: 99,
    isDuplicate: false,
    dateISO: "2026-02-21T07:00:00",
    date: "Feb 21, 2026",
    upvotes: 87,
    statusHistory: [
      { status: "reported", date: "Feb 21, 2026", note: "Complaint received" },
      { status: "assigned", date: "Feb 21, 2026", note: "Assigned to TWAD Board" },
    ],
  },
  {
    id: "FIX-2026-008",
    title: "Broken footpath tiles near Vellore Medical College",
    category: "roads",
    description:
      "Footpath tiles in front of Vellore Government Medical College have been broken and uplifted. Patients and elderly visitors are tripping on these. Several injury complaints received.",
    status: "pending",
    priority: "medium",
    location: {
      lat: 12.9225,
      lng: 79.1442,
      address: "Vellore Medical College Road",
      city: "Vellore",
      district: "Vellore",
    },
    reporter: { name: "Anbu Selvam", email: "anbu@example.com", userId: "USR-008" },
    department: null,
    aiConfidence: 85,
    isDuplicate: false,
    dateISO: "2026-02-24T16:20:00",
    date: "Feb 24, 2026",
    upvotes: 29,
    statusHistory: [
      { status: "reported", date: "Feb 24, 2026", note: "Complaint received" },
      { status: "pending", date: "Feb 24, 2026", note: "Field inspection scheduled" },
    ],
  },
  {
    id: "FIX-2026-009",
    title: "Illegal garbage dumping near Erode bus terminal",
    category: "garbage",
    description:
      "Unauthorised waste disposal happening near the Erode bus terminal. Mixed industrial and household waste is being dumped here at night. Foul smell and disease risk for bus passengers.",
    status: "in-progress",
    priority: "medium",
    location: {
      lat: 11.3419,
      lng: 77.7230,
      address: "Erode Perundurai Road Bus Terminal",
      city: "Erode",
      district: "Erode",
    },
    reporter: { name: "Devi Lakshmi", email: "devi@example.com", userId: "USR-009" },
    department: "Sanitation",
    aiConfidence: 90,
    isDuplicate: false,
    dateISO: "2026-02-19T10:30:00",
    date: "Feb 19, 2026",
    upvotes: 13,
    statusHistory: [
      { status: "reported", date: "Feb 19, 2026", note: "Complaint received" },
      { status: "assigned", date: "Feb 20, 2026", note: "Assigned to Sanitation" },
      { status: "in-progress", date: "Feb 22, 2026", note: "Surveillance camera installed" },
    ],
  },
  {
    id: "FIX-2026-010",
    title: "Street lights damaged by cyclone in Nagapattinam",
    category: "lighting",
    description:
      "Over 40 street lights along Nagapattinam beachfront road were damaged in the recent cyclone. The entire stretch from ferry point to lighthouse is dark at night creating safety issues for fishermen.",
    status: "resolved",
    priority: "high",
    location: {
      lat: 10.7631,
      lng: 79.8422,
      address: "Beach Road, Near Lighthouse",
      city: "Nagapattinam",
      district: "Nagapattinam",
    },
    reporter: { name: "Muthusamy Vel", email: "muthu@example.com", userId: "USR-010" },
    department: "Electrical Dept.",
    aiConfidence: 95,
    isDuplicate: false,
    dateISO: "2026-02-10T18:00:00",
    date: "Feb 10, 2026",
    upvotes: 62,
    statusHistory: [
      { status: "reported", date: "Feb 10, 2026", note: "Complaint received" },
      { status: "in-progress", date: "Feb 12, 2026", note: "Emergency repairs started" },
      { status: "resolved", date: "Feb 18, 2026", note: "All 42 lights restored" },
    ],
  },
  {
    id: "FIX-2026-011",
    title: "Sewage overflow on Thanjavur Big Street",
    category: "drainage",
    description:
      "Sewage is overflowing from the manhole on Thanjavur Big Street near the Brihadeeswara temple entrance. The sewage mixes with rainwater and poses a serious health hazard for temple visitors.",
    status: "in-progress",
    priority: "high",
    location: {
      lat: 10.7834,
      lng: 79.1318,
      address: "Big Street, Near Brihadeeswara Temple",
      city: "Thanjavur",
      district: "Thanjavur",
    },
    reporter: { name: "Vasantha Kumari", email: "vasantha@example.com", userId: "USR-011" },
    department: "Public Works",
    aiConfidence: 92,
    isDuplicate: false,
    dateISO: "2026-02-25T12:00:00",
    date: "Feb 25, 2026",
    upvotes: 38,
    statusHistory: [
      { status: "reported", date: "Feb 25, 2026", note: "Complaint received" },
      { status: "assigned", date: "Feb 25, 2026", note: "Assigned to Public Works" },
      { status: "in-progress", date: "Feb 26, 2026", note: "Jet rodding machine deployed" },
    ],
  },
  {
    id: "FIX-2026-012",
    title: "Water contamination complaints in Tirunelveli",
    category: "water",
    description:
      "Residents of Tirunelveli Palayamkottai area are reporting discoloured and foul-smelling water from taps. Several cases of stomach illness reported in the locality over the past week.",
    status: "pending",
    priority: "high",
    location: {
      lat: 8.7139,
      lng: 77.7567,
      address: "Palayamkottai Main Road",
      city: "Tirunelveli",
      district: "Tirunelveli",
    },
    reporter: { name: "Solomon Raj", email: "solomon@example.com", userId: "USR-012" },
    department: null,
    aiConfidence: 88,
    isDuplicate: false,
    dateISO: "2026-02-26T07:45:00",
    date: "Feb 26, 2026",
    upvotes: 54,
    statusHistory: [
      { status: "reported", date: "Feb 26, 2026", note: "Complaint received" },
      { status: "pending", date: "Feb 26, 2026", note: "Water sample collected for testing" },
    ],
  },
  {
    id: "FIX-2026-013",
    title: "Pothole-filled road in Tiruppur garment area",
    category: "roads",
    description:
      "The industrial road in Tiruppur's garment hub has multiple potholes making it dangerous for lorries carrying fabric. Road has not been repaired in 2 years. Heavy goods vehicles face difficulty.",
    status: "assigned",
    priority: "medium",
    location: {
      lat: 11.1085,
      lng: 77.3411,
      address: "Industrial Estate Road, Tiruppur",
      city: "Tiruppur",
      district: "Tiruppur",
    },
    reporter: { name: "Bala Subramanian", email: "bala@example.com", userId: "USR-013" },
    department: "Roads Dept.",
    aiConfidence: 89,
    isDuplicate: false,
    dateISO: "2026-02-18T13:00:00",
    date: "Feb 18, 2026",
    upvotes: 20,
    statusHistory: [
      { status: "reported", date: "Feb 18, 2026", note: "Complaint received" },
      { status: "assigned", date: "Feb 19, 2026", note: "Road inspection done" },
    ],
  },
  {
    id: "FIX-2026-014",
    title: "No sanitation in Kanchipuram old town wards",
    category: "garbage",
    description:
      "Garbage collection has been inconsistent for 2 weeks in Kanchipuram temple town heritage area. Waste piling near silk shops and affecting tourism in the area.",
    status: "resolved",
    priority: "low",
    location: {
      lat: 12.8185,
      lng: 79.6947,
      address: "Temple Street, Kanchipuram",
      city: "Kanchipuram",
      district: "Kanchipuram",
    },
    reporter: { name: "Lakshmi Narayanan", email: "lakshmi@example.com", userId: "USR-014" },
    department: "Sanitation",
    aiConfidence: 94,
    isDuplicate: false,
    dateISO: "2026-02-14T09:00:00",
    date: "Feb 14, 2026",
    upvotes: 16,
    statusHistory: [
      { status: "reported", date: "Feb 14, 2026", note: "Complaint received" },
      { status: "in-progress", date: "Feb 15, 2026", note: "Collection resumed" },
      { status: "resolved", date: "Feb 17, 2026", note: "Area cleaned and sanitised" },
    ],
  },
  {
    id: "FIX-2026-015",
    title: "Damaged road near Rameswaram ferry point",
    category: "roads",
    description:
      "Road leading to the ferry point in Rameswaram is severely damaged at multiple spots. Pilgrims and tourists face difficulty accessing the ferry. Emergency repair needed before peak season.",
    status: "reported",
    priority: "medium",
    location: {
      lat: 9.2881,
      lng: 79.3174,
      address: "Ferry Point Road, Rameswaram",
      city: "Rameswaram",
      district: "Ramanathapuram",
    },
    reporter: { name: "Arjun Ravi", email: "arjun@example.com", userId: "USR-001" },
    department: null,
    aiConfidence: 86,
    isDuplicate: false,
    dateISO: "2026-02-26T10:30:00",
    date: "Feb 26, 2026",
    upvotes: 9,
    statusHistory: [
      { status: "reported", date: "Feb 26, 2026", note: "Complaint received" },
    ],
  },
  {
    id: "FIX-2026-016",
    title: "Broken water pipe in Ooty town area",
    category: "water",
    description:
      "A water pipe has burst near the Ooty botanical garden entrance. Water is being wasted and the road is waterlogged. As a hill station tourist area, immediate repair is necessary.",
    status: "in-progress",
    priority: "medium",
    location: {
      lat: 11.4102,
      lng: 76.6950,
      address: "Botanical Garden Road",
      city: "Ooty",
      district: "Nilgiris",
    },
    reporter: { name: "Priya Suresh", email: "priya@example.com", userId: "USR-002" },
    department: "TWAD Board",
    aiConfidence: 91,
    isDuplicate: false,
    dateISO: "2026-02-23T08:30:00",
    date: "Feb 23, 2026",
    upvotes: 14,
    statusHistory: [
      { status: "reported", date: "Feb 23, 2026", note: "Complaint received" },
      { status: "in-progress", date: "Feb 24, 2026", note: "Plumbers dispatched" },
    ],
  },
  {
    id: "FIX-2026-017",
    title: "Blocked drain near Cuddalore new bus stand",
    category: "drainage",
    description:
      "Main drain near Cuddalore new bus stand is choked with silt and plastic waste. Heavy rains forecast and drain capacity is at 10%. Risk of major flooding in the bus stand premises.",
    status: "pending",
    priority: "medium",
    location: {
      lat: 11.7447,
      lng: 79.7689,
      address: "New Bus Stand Road, Cuddalore",
      city: "Cuddalore",
      district: "Cuddalore",
    },
    reporter: { name: "Ravi Murugan", email: "ravi@example.com", userId: "USR-004" },
    department: null,
    aiConfidence: 83,
    isDuplicate: false,
    dateISO: "2026-02-22T15:00:00",
    date: "Feb 22, 2026",
    upvotes: 8,
    statusHistory: [
      { status: "reported", date: "Feb 22, 2026", note: "Complaint received" },
      { status: "pending", date: "Feb 22, 2026", note: "Awaiting department review" },
    ],
  },
  {
    id: "FIX-2026-018",
    title: "Street light pole fallen in Dindigul Takkar Nagar",
    category: "lighting",
    description:
      "A street light pole has toppled and is lying across the road in Dindigul Takkar Nagar. It is blocking one lane of traffic and the live wire is a major electric hazard for residents.",
    status: "resolved",
    priority: "high",
    location: {
      lat: 10.3624,
      lng: 77.9695,
      address: "Takkar Nagar Main Road, Dindigul",
      city: "Dindigul",
      district: "Dindigul",
    },
    reporter: { name: "Senthil Kumar", email: "senthil@example.com", userId: "USR-007" },
    department: "Electrical Dept.",
    aiConfidence: 98,
    isDuplicate: false,
    dateISO: "2026-02-16T17:00:00",
    date: "Feb 16, 2026",
    upvotes: 30,
    statusHistory: [
      { status: "reported", date: "Feb 16, 2026", note: "Emergency complaint received" },
      { status: "in-progress", date: "Feb 16, 2026", note: "Electricity cut to area" },
      { status: "resolved", date: "Feb 17, 2026", note: "Pole replaced and power restored" },
    ],
  },
  {
    id: "FIX-2026-019",
    title: "Thoothukudi port area road heavily damaged",
    category: "roads",
    description:
      "Road near Thoothukudi VOC Port connecting the industrial units has deep potholes and is completely damaged in 300m stretch. Heavy port lorries make it especially dangerous for other vehicles.",
    status: "assigned",
    priority: "high",
    location: {
      lat: 8.7642,
      lng: 78.1348,
      address: "VOC Port Road, Thoothukudi",
      city: "Thoothukudi",
      district: "Thoothukudi",
    },
    reporter: { name: "Devi Lakshmi", email: "devi@example.com", userId: "USR-009" },
    department: "Roads Dept.",
    aiConfidence: 90,
    isDuplicate: false,
    dateISO: "2026-02-20T11:00:00",
    date: "Feb 20, 2026",
    upvotes: 25,
    statusHistory: [
      { status: "reported", date: "Feb 20, 2026", note: "Complaint received" },
      { status: "assigned", date: "Feb 21, 2026", note: "Survey completed" },
    ],
  },
  {
    id: "FIX-2026-020",
    title: "Water stagnation near Nagercoil market",
    category: "drainage",
    description:
      "Stagnant water has been accumulating near Nagercoil main market for a week. No proper drainage in the area and the stagnation is breeding mosquitoes. Dengue risk for vendors and shoppers.",
    status: "reported",
    priority: "medium",
    location: {
      lat: 8.1744,
      lng: 77.4330,
      address: "Main Market Road, Nagercoil",
      city: "Nagercoil",
      district: "Kanyakumari",
    },
    reporter: { name: "Vasantha Kumari", email: "vasantha@example.com", userId: "USR-011" },
    department: null,
    aiConfidence: 87,
    isDuplicate: false,
    dateISO: "2026-02-26T09:00:00",
    date: "Feb 26, 2026",
    upvotes: 12,
    statusHistory: [
      { status: "reported", date: "Feb 26, 2026", note: "Complaint received" },
    ],
  },
  {
    id: "FIX-2026-021",
    title: "Potholes on Kumbakonam Temple Road",
    category: "roads",
    description:
      "Multiple potholes on the road connecting Kumbakonam major temples. During Kumbabhishekam season thousands of pilgrims use this road daily. Immediate patch work needed.",
    status: "pending",
    priority: "medium",
    location: {
      lat: 10.9617,
      lng: 79.3875,
      address: "TSR Big Street, Kumbakonam",
      city: "Kumbakonam",
      district: "Thanjavur",
    },
    reporter: { name: "Arjun Ravi", email: "arjun@example.com", userId: "USR-001" },
    department: null,
    aiConfidence: 82,
    isDuplicate: false,
    dateISO: "2026-02-25T14:30:00",
    date: "Feb 25, 2026",
    upvotes: 19,
    statusHistory: [
      { status: "reported", date: "Feb 25, 2026", note: "Complaint received" },
      { status: "pending", date: "Feb 25, 2026", note: "Awaiting field inspection" },
    ],
  },
  {
    id: "FIX-2026-022",
    title: "Broken streetlights in Coimbatore RS Puram",
    category: "lighting",
    description:
      "At least 15 street lights are non-functional in the R.S. Puram residential area of Coimbatore. Multiple theft incidents reported due to darkness. Elderly residents fear going out after 8 PM.",
    status: "in-progress",
    priority: "medium",
    location: {
      lat: 11.0042,
      lng: 76.9669,
      address: "R.S. Puram, Coimbatore",
      city: "Coimbatore",
      district: "Coimbatore",
    },
    reporter: { name: "Kavitha Menon", email: "kavitha@example.com", userId: "USR-003" },
    department: "Electrical Dept.",
    aiConfidence: 93,
    isDuplicate: false,
    dateISO: "2026-02-21T20:00:00",
    date: "Feb 21, 2026",
    upvotes: 27,
    statusHistory: [
      { status: "reported", date: "Feb 21, 2026", note: "Complaint received" },
      { status: "in-progress", date: "Feb 23, 2026", note: "Repairs underway" },
    ],
  },
  {
    id: "FIX-2026-023",
    title: "Garbage accumulation near Marina Beach entrance",
    category: "garbage",
    description:
      "Tonnes of plastic waste and food packaging have accumulated near the South entrance of Marina Beach. Despite tourism signage, waste is piling up. Immediate clean-up drive required.",
    status: "resolved",
    priority: "low",
    location: {
      lat: 13.0500,
      lng: 80.2824,
      address: "Marina Beach South Entrance",
      city: "Chennai",
      district: "Chennai",
    },
    reporter: { name: "Karthik Raja", email: "karthik@example.com", userId: "USR-006" },
    department: "Sanitation",
    aiConfidence: 96,
    isDuplicate: false,
    dateISO: "2026-02-15T06:30:00",
    date: "Feb 15, 2026",
    upvotes: 41,
    statusHistory: [
      { status: "reported", date: "Feb 15, 2026", note: "Complaint received" },
      { status: "in-progress", date: "Feb 15, 2026", note: "Corporation team deployed" },
      { status: "resolved", date: "Feb 16, 2026", note: "Beach cleaned - 4 tonnes collected" },
    ],
  },
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
  { id: 1, label: "Parsing natural language description", duration: 800 },
  { id: 2, label: "Auto-classifying issue category", duration: 1200 },
  { id: 3, label: "Checking for duplicates within 500m radius", duration: 1500 },
  { id: 4, label: "Computing AI priority score", duration: 1000 },
  { id: 5, label: "Routing to relevant department", duration: 700 },
];
