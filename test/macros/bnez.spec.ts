import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe("bnez", () => {
  it("creates a bne branch", () => {
    expect(assemble(`
      ADDIU A0 R0 1
      BNEZ A0 end
      NOP
      end:
      JR RA
    `, { text: true })).to.deep.equal([
      "ADDIU A0 R0 0x1",
      "BNE A0 R0 0x1",
      "NOP",
      "JR RA",
    ]);
  });
});
