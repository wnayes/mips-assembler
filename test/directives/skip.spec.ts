import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".skip", () => {
  it("passes over existing bytes", () => {
    const buffer = new ArrayBuffer(32);
    const dataView = new DataView(buffer);
    dataView.setUint32(12, 0x0C);
    dataView.setUint32(16, 0x0C);
    dataView.setUint32(20, 0x0C);

    expect(print(assemble(`
      ADDU A0 A2 R0
      JR RA
      NOP
      .skip 12
      LUI A0 0x3F
      LH A0 0(V0)
    `, { buffer }))).to.deep.equal([
      "ADDU A0 A2 R0",
      "JR RA",
      "NOP",
      "SYSCALL",
      "SYSCALL",
      "SYSCALL",
      "LUI A0 0x3F",
      "LH A0 0(V0)",
    ]);
  });

  it("throws an exception for negative skips", () => {
    expect(() => {
      print(assemble(`
        ADDU A0 A2 R0
        JR RA
        NOP
        .skip -12
        LUI A0 0x3F
        LH A0 0(V0)
      `));
    }).to.throw(".skip directive cannot skip a negative length.");
  });
});
