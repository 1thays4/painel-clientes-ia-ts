import { formatarTelefone } from "../utils/formatarTelefone";

describe("formatarTelefone", () => {
  it("formata número completo com código do país", () => {
    expect(formatarTelefone("554791767425")).toMatch(/^\+55 \(47\)/);
  });

  it("formata número com DDD sem código do país", () => {
    expect(formatarTelefone("47917674255")).toMatch(/^\(47\)/);
  });

  it("retorna número curto sem alteração", () => {
    expect(formatarTelefone("12345")).toBe("12345");
  });

  it("remove caracteres não numéricos antes de formatar", () => {
    const resultado = formatarTelefone("+55 (47) 9 1767-4255");
    expect(resultado).toMatch(/^\+55/);
  });
});
