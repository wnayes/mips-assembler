import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".align", () => {
  it("writes zeroes to align the buffer", () => {
    expect(print(assemble(`
      ADDU A0 A2 R0
      JR RA
      NOP
      .align 32
      LUI A0 0x3F
      LH A0 0(V0)
    `))).to.deep.equal([
      "ADDU A0 A2 R0",
      "JR RA",
      "NOP",
      "NOP",
      "NOP",
      "NOP",
      "NOP",
      "NOP",
      "LUI A0 0x3F",
      "LH A0 0(V0)",
    ]);
  });

  it("does nothing if already aligned", () => {
    expect(print(assemble(`
      ADDU A0 A2 R0
      .align 4
      JR RA
      NOP
    `))).to.deep.equal([
      "ADDU A0 A2 R0",
      "JR RA",
      "NOP",
    ]);
  });
});
