import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe("org()", () => {
  it("outputs the current memory address into the output", () => {
    const buffer = new ArrayBuffer(12);
    const dataView = new DataView(buffer);
    assemble(`
      .word org()
      .byte org()
      .align 4
      LUI A0 org()
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0);
    expect(dataView.getUint8(4)).to.equal(4);
    expect(dataView.getUint32(8)).to.equal(0x3C040008); // LUI A0 8
  });
});
