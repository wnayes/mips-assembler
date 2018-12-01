import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".if", () => {
  it("allows a region to be assembled if the condition is true", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      LUI A0 0x3F
      .if 1
      LH A0 0(V0)
      ADDIU V0 R0 10
      .endif
      JR RA
      NOP
    `))).to.deep.equal([
      "LW T0 0(GP)",
      "JAL 0x12344",
      "NOP",
      "LUI A0 0x3F",
      "LH A0 0(V0)",
      "ADDIU V0 R0 0xA",
      "JR RA",
      "NOP",
    ]);
  });

  it("prevents a region from being output if the condition is false", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      LUI A0 0x3F
      .if 0
      LH A0 0(V0)
      ADDIU V0 R0 10
      .endif
      JR RA
      NOP
    `))).to.deep.equal([
      "LW T0 0(GP)",
      "JAL 0x12344",
      "NOP",
      "LUI A0 0x3F",
      "JR RA",
      "NOP",
    ]);
  });

  it("supports nested ifs", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      LUI A0 0x3F
      .if 1
      LH A0 0(V0)
      .if 1
      ADDIU V0 R0 10
      .endif
      .endif
      JR RA
      NOP
    `))).to.deep.equal([
      "LW T0 0(GP)",
      "JAL 0x12344",
      "NOP",
      "LUI A0 0x3F",
      "LH A0 0(V0)",
      "ADDIU V0 R0 0xA",
      "JR RA",
      "NOP",
    ]);

    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      LUI A0 0x3F
      .if 1
      LH A0 0(V0)
      .if 0
      ADDIU V0 R0 10
      .endif
      .endif
      JR RA
      NOP
    `))).to.deep.equal([
      "LW T0 0(GP)",
      "JAL 0x12344",
      "NOP",
      "LUI A0 0x3F",
      "LH A0 0(V0)",
      "JR RA",
      "NOP",
    ]);
  });

  it("evaluates the condition from a label", () => {
    expect(print(assemble(`
      .definelabel truthy,100
      .if truthy
      LH A0 0(V0)
      ADDIU V0 R0 10
      .endif
    `))).to.deep.equal([
      "LH A0 0(V0)",
      "ADDIU V0 R0 0xA",
    ]);
  });

  it("must have the conditional label evaluated prior to testing it", () => {
    expect(() => print(assemble(`
      .if truthy
      LH A0 0(V0)
      ADDIU V0 R0 10
      .endif
      .definelabel truthy,100
    `))).to.throw;
  });

  it("complains about unbalanced endif", () => {
    expect(() => print(assemble(`
      .if 1
      LH A0 0(V0)
      ADDIU V0 R0 10
      .endif
      .endif
    `))).to.throw;
  });
});
