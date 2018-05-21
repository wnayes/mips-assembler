import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".orga", () => {
  it("adjusts the output position in the given buffer", () => {
    const buffer = new ArrayBuffer(32);
    expect(print(assemble(`
      ADDU A0 A2 R0
      JR RA
      NOP
      .orga 24
      LUI A0 0x3F
      LH A0 0(V0)
    `, { buffer }))).to.deep.equal([
      "ADDU A0 A2 R0",
      "JR RA",
      "NOP",
      "NOP",
      "NOP",
      "NOP",
      "LUI A0 0x3F",
      "LH A0 0(V0)",
    ]);
  });
});
