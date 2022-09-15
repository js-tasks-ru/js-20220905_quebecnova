import { Functions } from "./index";

describe("should return true with passed arguments", () => {
  const functions = new Functions();

  it("returnTrue0", () => {
    expect(functions.returnTrue0(true)).toEqual(true);
  });

  it("returnTrue1", () => {
    expect(functions.returnTrue1("abcd")).toEqual(true);
  });

  it("returnTrue2", () => {
    expect(functions.returnTrue2(NaN)).toEqual(true);
  });

  it("returnTrue3", () => {
    expect(functions.returnTrue3([1], "1", [1])).toEqual(true);
  });

  it("returnTrue4", () => {
    expect(functions.returnTrue4(Number.MAX_SAFE_INTEGER)).toEqual(true);
  });

  it("returnTrue5", () => {
    const obj = {};
    obj[obj] = "a";
    expect(functions.returnTrue5(obj)).toEqual(true);
  });

  it("returnTrue6", () => {
    const obj = {};
    obj[obj] = obj;
    expect(functions.returnTrue6(obj)).toEqual(true);
  });

  it("returnTrue7", () => {
    expect(functions.returnTrue7(-0, 0)).toEqual(true);
  });
});
