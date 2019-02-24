import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe("bnezl", () => {
  it("creates a bnel branch", () => {
    expect(assemble(`
      ADDIU A0 R0 1
      BNEZL A0 end
      NOP
      end:
      JR RA
    `, { text: true })).to.deep.equal([
      "ADDIU A0 R0 0x1",
      "BNEL A0 R0 0x1",
      "NOP",
      "JR RA",
    ]);
  });
});
