import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".elseif", () => {
  it("executes if an if condition was false", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .if 0
      LUI A0 0x3F
      LH A0 0(V0)
      .elseif 2
      ADDIU V0 R0 10
      .endif
      JR RA
      NOP
    `))).to.deep.equal([
      "LW T0 0(GP)",
      "JAL 0x12344",
      "NOP",
      "ADDIU V0 R0 0xA",
      "JR RA",
      "NOP",
    ]);
  });

  it("doesn't execute if an if condition was true", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .if 1
      LUI A0 0x3F
      LH A0 0(V0)
      .elseif 2
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
      "JR RA",
      "NOP",
    ]);
  });

  it("supports nesting", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .if 0
        NOP
      .elseif 1
        LUI A0 0x3F
        .if 1
          LH A0 0(V0)
        .elseif 1
          NOP
        .endif
      .else
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
      "JR RA",
      "NOP",
    ]);
  });

  it("seeing an elseif after an else causes an error", () => {
    expect(() => print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .if 0
      LUI A0 0x3F
      .else
      LH A0 0(V0)
      .elseif 2
      ADDIU V0 R0 10
      .endif
      JR RA
      NOP
    `))).to.throw();
  });
});
