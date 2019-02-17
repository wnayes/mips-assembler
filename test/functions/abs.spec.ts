import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe("abs()", () => {
  it("correctly performs the absolute value operation", () => {
    const buffer = new ArrayBuffer(12);
    const dataView = new DataView(buffer);
    assemble(`
      .word abs(-1234)
      .byte abs(-1)
      .align 4
      LUI A0 abs(12)
    `, { buffer });

    expect(dataView.getInt32(0)).to.equal(1234);
    expect(dataView.getInt8(4)).to.equal(1);
    expect(dataView.getUint32(8)).to.equal(0x3C04000C); // LUI A0 12
  });
});
