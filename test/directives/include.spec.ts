import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".include", () => {
  it("includes content from the files opt", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .include "example1"
      JR RA
      NOP
    `, {
      files: {
        example1: `
          LUI A0 0x3F
          LH A0 0(V0)
          ADDIU V0 R0 10
        `
      }
    }))).to.deep.equal([
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

  it("supports nested includes", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .include "example1"
      JR RA
      NOP
    `, {
      files: {
        example1: `.include "example2"`,
        example2: `
          LUI A0 0x3F
          LH A0 0(V0)
          ADDIU V0 R0 10
        `
      }
    }))).to.deep.equal([
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

  it("handles @static labels", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .include "example1"
      JR RA
      NOP
    `, {
      files: {
        example1: `
          LUI A0 0x3F
          BEQ A0 R0 @end
          LH A0 0(V0)
          @end:
          ADDIU V0 R0 10
        `
      }
    }))).to.deep.equal([
      "LW T0 0(GP)",
      "JAL 0x12344",
      "NOP",
      "LUI A0 0x3F",
      "BEQ A0 R0 0x1",
      "LH A0 0(V0)",
      "ADDIU V0 R0 0xA",
      "JR RA",
      "NOP",
    ]);
  });

  it("handles @static labels in directives", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .include "example1"
      JR RA
      NOP
    `, {
      files: {
        example1: `
          .definelabel @static_value,0x100
          LUI A0 @static_value
          LH A0 0(V0)
          ADDIU V0 R0 10
        `
      }
    }))).to.deep.equal([
      "LW T0 0(GP)",
      "JAL 0x12344",
      "NOP",
      "LUI A0 0x100",
      "LH A0 0(V0)",
      "ADDIU V0 R0 0xA",
      "JR RA",
      "NOP",
    ]);
  });

  it("doesn't leak static labels outside of file", () => {
    expect(() => assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .beginfile
      LUI A0 0x3F
      BEQ A0 R0 @end
      LH A0 0(V0)
      @end:
      ADDIU V0 R0 10
      .endfile
      JR RA
      BNE R0 R0 @end
      NOP
    `)).to.throw();
  });

  it("handles same static label inside multiple files", () => {
    expect(print(assemble(`
      LW T0 0(GP)
      JAL 0x80012344
      NOP
      .beginfile
      LUI A0 0x3F
      BEQ A0 R0 @end
      LH A0 0(V0)
      @end:
      ADDIU V0 R0 10
      .endfile
      .beginfile
      LUI A0 0x3F
      BEQ A0 R0 @end
      LH A0 0(V0)
      @end:
      ADDIU V0 R0 10
      .endfile
      JR RA
      NOP
    `))).to.deep.equal([
      "LW T0 0(GP)",
      "JAL 0x12344",
      "NOP",
      "LUI A0 0x3F",
      "BEQ A0 R0 0x1",
      "LH A0 0(V0)",
      "ADDIU V0 R0 0xA",
      "LUI A0 0x3F",
      "BEQ A0 R0 0x1",
      "LH A0 0(V0)",
      "ADDIU V0 R0 0xA",
      "JR RA",
      "NOP",
    ]);
  });
});
