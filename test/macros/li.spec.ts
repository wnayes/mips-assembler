import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe("li", () => {
  it("uses addiu for small numbers", () => {
    expect(assemble(`
      LI A0 0
      LI A0 1
      LI A0 -1
      LI A0 -32768
      LI A0 32767
    `, { text: true })).to.deep.equal([
      "ADDIU A0 R0 0",
      "ADDIU A0 R0 0x1",
      "ADDIU A0 R0 -0x1",
      "ADDIU A0 R0 -0x8000",
      "ADDIU A0 R0 0x7FFF",
    ]);
  });

  it("uses ori for 16 bit unsigned numbers", () => {
    expect(assemble(`
      LI A0 0xFFFF
      LI A0 0xF000
    `, { text: true })).to.deep.equal([
      "ORI A0 R0 0xFFFF",
      "ORI A0 R0 0xF000",
    ]);
  });

  it("uses lui for values masked by 0xFFFF0000", () => {
    expect(assemble(`
      LI A0 0x0FFF0000
      LI A0 0xFFFF0000
      LI A0 0x00010000
    `, { text: true })).to.deep.equal([
      "LUI A0 0xFFF",
      "LUI A0 -0x1",
      "LUI A0 0x1",
    ]);
  });

  it("uses lui/addiu for larger numbers", () => {
    expect(assemble(`
      LI A0 0x00010001
      LI A0 0x0FFFFFFF
    `, { text: true })).to.deep.equal([
      "LUI A0 0x1",
      "ADDIU A0 A0 0x1",
      "LUI A0 0x1000",
      "ADDIU A0 A0 0xFFFF",
    ]);
  });
});
