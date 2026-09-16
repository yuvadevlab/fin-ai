import { describe, expect, it } from "vitest";
import { bestEntityMatch, scoreEntityMatch } from "./utils/entity-match.utils";

describe("entity-match.utils with dynamic categories", () => {
  it("matches dynamic custom category 'Self Care' to query 'Haircut'", () => {
    const customCategories = [
      { id: "1", name: "Salary" },
      { id: "2", name: "Self Care" },
      { id: "3", name: "Daily Commute" },
      { id: "4", name: "House Rent" },
    ];
    const match = bestEntityMatch(customCategories, "Haircut");
    expect(match?.name).toBe("Self Care");
  });

  it("matches dynamic custom category 'Salon & Spa' to query 'Haircut'", () => {
    const customCategories = [
      { id: "1", name: "Salary" },
      { id: "2", name: "Salon & Spa" },
      { id: "3", name: "Groceries" },
    ];
    const match = bestEntityMatch(customCategories, "Haircut");
    expect(match?.name).toBe("Salon & Spa");
  });

  it("matches dynamic category 'Daily Commute' to query 'Uber'", () => {
    const customCategories = [
      { id: "1", name: "Daily Commute" },
      { id: "2", name: "Dining Out" },
    ];
    expect(bestEntityMatch(customCategories, "Uber")?.name).toBe("Daily Commute");
    expect(bestEntityMatch(customCategories, "Auto fare")?.name).toBe("Daily Commute");
  });

  it("matches dynamic category 'Doctor & Medical' to query 'Clinic'", () => {
    const customCategories = [
      { id: "1", name: "Doctor & Medical" },
      { id: "2", name: "Personal Care" },
    ];
    expect(bestEntityMatch(customCategories, "Clinic visit")?.name).toBe("Doctor & Medical");
    expect(bestEntityMatch(customCategories, "Medicines")?.name).toBe("Doctor & Medical");
  });

  it("tolerates typos on custom categories using edit distance", () => {
    const customCategories = [
      { id: "1", name: "Groceries" },
      { id: "2", name: "Restaurants" },
      { id: "3", name: "Badminton Club" },
    ];
    expect(bestEntityMatch(customCategories, "groseris")?.name).toBe("Groceries");
    expect(bestEntityMatch(customCategories, "resturant")?.name).toBe("Restaurants");
    expect(bestEntityMatch(customCategories, "badminton")?.name).toBe("Badminton Club");
  });

  it("exact match retains highest priority score", () => {
    expect(scoreEntityMatch("Salary", "Salary")).toBe(100);
    expect(scoreEntityMatch("Self Care", "Haircut")).toBeGreaterThan(50);
  });
});
