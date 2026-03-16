/**
 * Static mock data — used while the database is offline.
 * Delete this file and revert hooks once the DB is back.
 */

import type { ApiComplaint, ApiComplaintDetail, ApiUser, ApiNotification } from "./api";

export const STATIC_USER: ApiUser = {
  id: "u1",
  name: "Sandhosh G",
  email: "sandhosh@example.com",
  role: "ADMIN",
  district: "Chennai",
  phone: "9876543210",
  createdAt: "2025-12-01T10:00:00Z",
};

export const STATIC_DEPARTMENTS = [
  { id: "d1", name: "Roads & Highways", _count: { complaints: 4 } },
  { id: "d2", name: "Water Supply", _count: { complaints: 3 } },
  { id: "d3", name: "Sanitation", _count: { complaints: 2 } },
  { id: "d4", name: "Electricity", _count: { complaints: 2 } },
  { id: "d5", name: "Public Health", _count: { complaints: 1 } },
];

const baseComplaints: ApiComplaintDetail[] = [
  {
    id: "c1", refId: "FIN-2026-001", title: "Large pothole on Anna Salai near Gemini Flyover",
    category: "roads", status: "in-progress", priority: "high",
    lat: 13.0604, lng: 80.2496, address: "Anna Salai", city: "Chennai", district: "Chennai",
    photoUrl: undefined, aiConfidence: 0.92, upvotes: 34, isDuplicate: false,
    createdAt: "2026-03-10T08:30:00Z",
    description: "A large pothole approximately 3 feet wide has formed on Anna Salai near the Gemini Flyover junction. Multiple vehicles have been damaged.",
    reporter: { id: "u2", name: "Ravi Kumar" },
    department: { id: "d1", name: "Roads & Highways" },
    statusHistory: [
      { id: "sh1", status: "reported", createdAt: "2026-03-10T08:30:00Z" },
      { id: "sh2", status: "assigned", note: "Assigned to Roads dept", createdAt: "2026-03-11T09:00:00Z" },
      { id: "sh3", status: "in-progress", note: "Crew dispatched", createdAt: "2026-03-12T14:00:00Z" },
    ],
  },
  {
    id: "c2", refId: "FIN-2026-002", title: "Broken water pipe flooding Mylapore street",
    category: "water", status: "assigned", priority: "high",
    lat: 13.0339, lng: 80.2676, address: "Kutchery Road", city: "Chennai", district: "Chennai",
    photoUrl: undefined, aiConfidence: 0.88, upvotes: 21, isDuplicate: false,
    createdAt: "2026-03-11T06:15:00Z",
    description: "Broken main water pipe causing street flooding. Water is wasted continuously for the past 2 days.",
    reporter: { id: "u3", name: "Priya S" },
    department: { id: "d2", name: "Water Supply" },
    statusHistory: [
      { id: "sh4", status: "reported", createdAt: "2026-03-11T06:15:00Z" },
      { id: "sh5", status: "assigned", note: "Sent to Water Supply", createdAt: "2026-03-12T10:00:00Z" },
    ],
  },
  {
    id: "c3", refId: "FIN-2026-003", title: "Garbage not collected in T. Nagar Ward 125",
    category: "sanitation", status: "resolved", priority: "medium",
    lat: 13.0418, lng: 80.2341, address: "Panagal Park Road", city: "Chennai", district: "Chennai",
    photoUrl: undefined, aiConfidence: 0.95, upvotes: 45, isDuplicate: false,
    createdAt: "2026-03-05T07:00:00Z",
    description: "Garbage bins overflowing for the past week in T. Nagar Ward 125 near Panagal Park.",
    reporter: { id: "u4", name: "Meena R" },
    department: { id: "d3", name: "Sanitation" },
    statusHistory: [
      { id: "sh6", status: "reported", createdAt: "2026-03-05T07:00:00Z" },
      { id: "sh7", status: "assigned", createdAt: "2026-03-06T09:00:00Z" },
      { id: "sh8", status: "in-progress", createdAt: "2026-03-07T08:00:00Z" },
      { id: "sh9", status: "resolved", note: "Area cleaned and bins replaced", createdAt: "2026-03-08T16:00:00Z" },
    ],
  },
  {
    id: "c4", refId: "FIN-2026-004", title: "Street lights not working on ECR stretch",
    category: "electricity", status: "pending", priority: "medium",
    lat: 12.9516, lng: 80.2395, address: "East Coast Road", city: "Chennai", district: "Kanchipuram",
    photoUrl: undefined, aiConfidence: 0.85, upvotes: 18, isDuplicate: false,
    createdAt: "2026-03-13T19:30:00Z",
    description: "About 500m stretch of street lights not working on ECR near Thiruvanmiyur. Very dangerous at night.",
    reporter: { id: "u5", name: "Arun V" },
    department: undefined,
    statusHistory: [
      { id: "sh10", status: "reported", createdAt: "2026-03-13T19:30:00Z" },
      { id: "sh11", status: "pending", note: "Awaiting department assignment", createdAt: "2026-03-14T09:00:00Z" },
    ],
  },
  {
    id: "c5", refId: "FIN-2026-005", title: "Dengue breeding spots in Adyar canal area",
    category: "health", status: "in-progress", priority: "critical",
    lat: 13.0067, lng: 80.2563, address: "Adyar Canal Road", city: "Chennai", district: "Chennai",
    photoUrl: undefined, aiConfidence: 0.91, upvotes: 56, isDuplicate: false,
    createdAt: "2026-03-08T10:00:00Z",
    description: "Stagnant water pools along Adyar canal are breeding mosquitoes. Several dengue cases reported in the locality.",
    reporter: { id: "u1", name: "Sandhosh G" },
    department: { id: "d5", name: "Public Health" },
    statusHistory: [
      { id: "sh12", status: "reported", createdAt: "2026-03-08T10:00:00Z" },
      { id: "sh13", status: "assigned", createdAt: "2026-03-09T08:00:00Z" },
      { id: "sh14", status: "in-progress", note: "Fogging team deployed", createdAt: "2026-03-10T07:00:00Z" },
    ],
  },
  {
    id: "c6", refId: "FIN-2026-006", title: "Overflowing sewage near Chromepet bus stand",
    category: "sanitation", status: "reported", priority: "high",
    lat: 12.9516, lng: 80.1462, address: "GST Road, Chromepet", city: "Chennai", district: "Kanchipuram",
    photoUrl: undefined, aiConfidence: 0.87, upvotes: 12, isDuplicate: false,
    createdAt: "2026-03-15T11:00:00Z",
    description: "Sewage overflowing near the Chromepet bus stand causing unbearable stench and health hazard.",
    reporter: { id: "u6", name: "Karthik M" },
    department: undefined,
    statusHistory: [
      { id: "sh15", status: "reported", createdAt: "2026-03-15T11:00:00Z" },
    ],
  },
  {
    id: "c7", refId: "FIN-2026-007", title: "Road cave-in on Mount Road near Express Avenue",
    category: "roads", status: "in-progress", priority: "critical",
    lat: 13.0583, lng: 80.2614, address: "Mount Road", city: "Chennai", district: "Chennai",
    photoUrl: undefined, aiConfidence: 0.96, upvotes: 67, isDuplicate: false,
    createdAt: "2026-03-09T15:45:00Z",
    description: "Major road cave-in on Mount Road near Express Avenue mall. Traffic diverted. Dangerous for pedestrians.",
    reporter: { id: "u7", name: "Deepa L" },
    department: { id: "d1", name: "Roads & Highways" },
    statusHistory: [
      { id: "sh16", status: "reported", createdAt: "2026-03-09T15:45:00Z" },
      { id: "sh17", status: "assigned", createdAt: "2026-03-09T17:00:00Z" },
      { id: "sh18", status: "in-progress", note: "Emergency repair underway", createdAt: "2026-03-10T06:00:00Z" },
    ],
  },
  {
    id: "c8", refId: "FIN-2026-008", title: "Contaminated water supply in Ambattur zone",
    category: "water", status: "resolved", priority: "critical",
    lat: 13.0982, lng: 80.1621, address: "Ambattur Industrial Estate", city: "Chennai", district: "Tiruvallur",
    photoUrl: undefined, aiConfidence: 0.93, upvotes: 89, isDuplicate: false,
    createdAt: "2026-03-01T05:00:00Z",
    description: "Residents reporting yellow/muddy water from taps in Ambattur zone. Multiple families fell sick.",
    reporter: { id: "u8", name: "Lakshmi N" },
    department: { id: "d2", name: "Water Supply" },
    statusHistory: [
      { id: "sh19", status: "reported", createdAt: "2026-03-01T05:00:00Z" },
      { id: "sh20", status: "assigned", createdAt: "2026-03-01T09:00:00Z" },
      { id: "sh21", status: "in-progress", note: "Water testing done", createdAt: "2026-03-02T10:00:00Z" },
      { id: "sh22", status: "resolved", note: "Pipe replaced, water supply restored", createdAt: "2026-03-04T14:00:00Z" },
    ],
  },
];

export const STATIC_COMPLAINTS: ApiComplaintDetail[] = baseComplaints;

// User's own complaints (subset)
export const STATIC_MY_COMPLAINTS: ApiComplaintDetail[] = baseComplaints.filter(
  (c) => c.reporter.id === "u1",
);

export const STATIC_NOTIFICATIONS: ApiNotification[] = [
  {
    id: "n1", title: "Complaint status updated", body: "Your complaint FIN-2026-005 (Dengue breeding spots) is now in-progress.",
    isRead: false, type: "status_update", refId: "FIN-2026-005", createdAt: "2026-03-10T07:00:00Z",
  },
  {
    id: "n2", title: "New upvote", body: "Your complaint FIN-2026-005 received a new upvote. Total: 56",
    isRead: true, type: "upvote", refId: "FIN-2026-005", createdAt: "2026-03-12T14:30:00Z",
  },
  {
    id: "n3", title: "Welcome to Fix It Now!", body: "Thank you for joining. Start by reporting your first civic issue.",
    isRead: true, type: "system", createdAt: "2025-12-01T10:00:00Z",
  },
];
