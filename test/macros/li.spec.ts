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
      LI A0 0x80706050
      LI A0 0xFFFEFFFF
    `, { text: true })).to.deep.equal([
      "LUI A0 0x1",
      "ADDIU A0 A0 0x1",
      "LUI A0 0x1000",
      "ADDIU A0 A0 0xFFFF",
      "LUI A0 0x8070",
      "ADDIU A0 A0 0x6050",
      "LUI A0 0xFFFF",
      "ADDIU A0 A0 0xFFFF",
    ]);
  });

  it("resolves labels if they are defined in the first pass", () => {
    expect(assemble(`
      .definelabel testlbl,-1
      LI A0 testlbl
    `, { text: true })).to.deep.equal([
      "ADDIU A0 R0 -0x1",
    ]);
  });

  it("can handle labels not seen yet, but with less efficient code", () => {
    expect(assemble(`
      LI A0 testlbl1
      LI A0 testlbl2
      NOP
      .definelabel testlbl1,10
      .definelabel testlbl2,0x8012EFAE
    `, { text: true })).to.deep.equal([
      "LUI A0 0",
      "ADDIU A0 A0 0xA",
      "LUI A0 0x8013",
      "ADDIU A0 A0 0xEFAE",
      "NOP",
    ]);
  });
});
