import { isAuthorizedEmail } from "../utils/emailValidator";

describe("isAuthorizedEmail", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("rejeita email vazio em produção", () => {
    process.env.NODE_ENV = "production";
    expect(isAuthorizedEmail("")).toBe(false);
  });

  it("aceita email de domínio autorizado em produção", () => {
    process.env.NODE_ENV = "production";
    expect(isAuthorizedEmail("user@gmail.com")).toBe(true);
  });

  it("aceita email específico autorizado em produção", () => {
    process.env.NODE_ENV = "production";
    expect(isAuthorizedEmail("admin@example.com")).toBe(true);
  });

  it("rejeita email não autorizado em produção", () => {
    process.env.NODE_ENV = "production";
    expect(isAuthorizedEmail("hacker@evil.com")).toBe(false);
  });

  it("aceita qualquer email em desenvolvimento", () => {
    process.env.NODE_ENV = "development";
    expect(isAuthorizedEmail("anyone@anything.com")).toBe(true);
  });
});
