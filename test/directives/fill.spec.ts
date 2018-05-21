import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".fill", () => {
  it("writes zeroes, by default, to the buffer", () => {
    expect(print(assemble(`
      ADDU A0 A2 R0
      JR RA
      NOP
      .fill 12
      LUI A0 0x3F
      LH A0 0(V0)
    `))).to.deep.equal([
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

  it("writes a given value to the buffer length times", () => {
    expect(print(assemble(`
      ADDU A0 A2 R0
      .fill 3, 0
      .fill 1, 0xC
      JR RA
      NOP
    `))).to.deep.equal([
      "ADDU A0 A2 R0",
      "SYSCALL",
      "JR RA",
      "NOP",
    ]);
  });

  it("only the lowest 8 bits of value are inserted", () => {
    expect(print(assemble(`
      ADDU A0 A2 R0
      .fill 3, 0x23230000
      .fill 1, 0x5456200C
      JR RA
      NOP
    `))).to.deep.equal([
      "ADDU A0 A2 R0",
      "SYSCALL",
      "JR RA",
      "NOP",
    ]);
  });

  it("throws an exception for negative fill length", () => {
    expect(() => {
      print(assemble(`
        ADDU A0 A2 R0
        .fill -4
        JR RA
        NOP
      `));
    }).to.throw(".fill length must be positive.");
  });
});
