import { describe, it, expect } from "vitest";
import {
  complaints,
  getComplaintsForUser,
  tnDistricts,
  departments,
  aiPipelineSteps,
  type IssueCategory,
  type IssueStatus,
  type IssuePriority,
} from "@/lib/mockData";

const VALID_CATEGORIES: IssueCategory[] = ["roads", "water", "garbage", "lighting", "drainage", "other"];
const VALID_STATUSES: IssueStatus[] = ["reported", "pending", "assigned", "in-progress", "resolved"];
const VALID_PRIORITIES: IssuePriority[] = ["low", "medium", "high"];

describe("mockData — complaints array", () => {
  it("contains at least 20 complaints", () => {
    expect(complaints.length).toBeGreaterThanOrEqual(20);
  });

  it("every complaint has a unique id", () => {
    const ids = complaints.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every complaint has a valid category", () => {
    complaints.forEach((c) => {
      expect(VALID_CATEGORIES).toContain(c.category);
    });
  });

  it("every complaint has a valid status", () => {
    complaints.forEach((c) => {
      expect(VALID_STATUSES).toContain(c.status);
    });
  });

  it("every complaint has a valid priority", () => {
    complaints.forEach((c) => {
      expect(VALID_PRIORITIES).toContain(c.priority);
    });
  });

  it("every complaint has valid Tamil Nadu coordinates", () => {
    // Tamil Nadu lat: ~8.0 – 13.5, lng: ~76.2 – 80.4
    complaints.forEach((c) => {
      expect(c.location.lat).toBeGreaterThanOrEqual(8.0);
      expect(c.location.lat).toBeLessThanOrEqual(14.0);
      expect(c.location.lng).toBeGreaterThanOrEqual(76.0);
      expect(c.location.lng).toBeLessThanOrEqual(81.0);
    });
  });

  it("every complaint has a non-empty title, description, and address", () => {
    complaints.forEach((c) => {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.location.address.length).toBeGreaterThan(0);
    });
  });

  it("every complaint has a parseable ISO date string", () => {
    complaints.forEach((c) => {
      const d = new Date(c.dateISO);
      expect(d.toString()).not.toBe("Invalid Date");
    });
  });

  it("every complaint has at least one status history entry", () => {
    complaints.forEach((c) => {
      expect(c.statusHistory.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("first statusHistory entry is always 'reported'", () => {
    complaints.forEach((c) => {
      expect(c.statusHistory[0].status).toBe("reported");
    });
  });

  it("last statusHistory entry matches the complaint's current status", () => {
    complaints.forEach((c) => {
      const last = c.statusHistory[c.statusHistory.length - 1];
      expect(last.status).toBe(c.status);
    });
  });

  it("aiConfidence is between 0 and 100", () => {
    complaints.forEach((c) => {
      expect(c.aiConfidence).toBeGreaterThanOrEqual(0);
      expect(c.aiConfidence).toBeLessThanOrEqual(100);
    });
  });

  it("upvotes is a non-negative integer", () => {
    complaints.forEach((c) => {
      expect(c.upvotes).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(c.upvotes)).toBe(true);
    });
  });
});

describe("getComplaintsForUser", () => {
  it("returns only complaints for the specified user", () => {
    const userId = "USR-001";
    const result = getComplaintsForUser(userId);
    result.forEach((c) => {
      expect(c.reporter.userId).toBe(userId);
    });
  });

  it("returns an empty array for a non-existent user", () => {
    expect(getComplaintsForUser("USR-UNKNOWN")).toHaveLength(0);
  });

  it("each known user has at least one complaint", () => {
    const userIds = [...new Set(complaints.map((c) => c.reporter.userId))];
    userIds.forEach((uid) => {
      expect(getComplaintsForUser(uid).length).toBeGreaterThan(0);
    });
  });

  it("total across all users equals complaints.length (no double-counting)", () => {
    const userIds = [...new Set(complaints.map((c) => c.reporter.userId))];
    const total = userIds.reduce((sum, uid) => sum + getComplaintsForUser(uid).length, 0);
    expect(total).toBe(complaints.length);
  });
});

describe("tnDistricts", () => {
  it("contains Chennai", () => {
    expect(tnDistricts).toContain("Chennai");
  });

  it("contains all complaint cities", () => {
    const complaintDistricts = new Set(complaints.map((c) => c.location.district));
    complaintDistricts.forEach((d) => {
      expect(tnDistricts).toContain(d);
    });
  });

  it("has no duplicate entries", () => {
    const unique = new Set(tnDistricts);
    expect(unique.size).toBe(tnDistricts.length);
  });
});

describe("departments", () => {
  it("contains at least 5 departments", () => {
    expect(departments.length).toBeGreaterThanOrEqual(5);
  });

  it("every assigned complaint's department is in the departments list", () => {
    complaints
      .filter((c) => c.department !== null)
      .forEach((c) => {
        expect(departments).toContain(c.department);
      });
  });
});

describe("aiPipelineSteps", () => {
  it("has exactly 5 steps", () => {
    expect(aiPipelineSteps).toHaveLength(5);
  });

  it("steps have unique IDs", () => {
    const ids = aiPipelineSteps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each step has a positive duration", () => {
    aiPipelineSteps.forEach((s) => {
      expect(s.duration).toBeGreaterThan(0);
    });
  });

  it("total pipeline duration is between 3 and 15 seconds", () => {
    const totalMs = aiPipelineSteps.reduce((a, s) => a + s.duration, 0);
    expect(totalMs).toBeGreaterThanOrEqual(3000);
    expect(totalMs).toBeLessThanOrEqual(15000);
  });
});
