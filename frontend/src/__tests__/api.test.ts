import api from "@/lib/api";

describe("api", () => {
  it("has correct baseURL", () => {
    expect(api.defaults.baseURL).toBe("http://localhost:8000/api/v1");
  });
});