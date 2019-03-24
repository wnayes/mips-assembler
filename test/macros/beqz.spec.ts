import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe("beqz", () => {
  it("creates a beq branch", () => {
    expect(assemble(`
      ADDIU A0 R0 1
      BEQZ A0 end
      NOP
      end:
      JR RA
    `, { text: true })).to.deep.equal([
      "ADDIU A0 R0 0x1",
      "BEQ A0 R0 0x1",
      "NOP",
      "JR RA",
    ]);
  });
});
