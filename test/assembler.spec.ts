import "mocha";
import { expect } from "chai";

import { assemble } from "../src/assembler";

describe("Assembler", () => {
  it("does basic loop", () => {
    expect(assemble(`
      .org 0x80004000
      main:
      ADDIU SP SP -32
      SW RA 24(SP)
      loop:
      JAL 0x80023456
      NOP
      BEQ V0 R0 loop
      NOP
      LW RA 24(SP)
      JR RA
      ADDIU SP SP 32
    `, { text: true })).to.deep.equal([
      "ADDIU SP SP -32",
      "SW RA 24(SP)",
      "JAL 0x80023456",
      "NOP",
      "BEQ V0 R0 -3",
      "NOP",
      "LW RA 24(SP)",
      "JR RA",
      "ADDIU SP SP 32",
    ]);
  });

  it("does branch forward", () => {
    expect(assemble(`
      .org 0x80004000
      main:
      ADDIU SP SP -32
      SW RA 24(SP)
      NOP
      BEQ V0 R0 skip
      JAL 0x80023456
      NOP
      skip:
      LW RA 24(SP)
      JR RA
      ADDIU SP SP 32
    `, { text: true })).to.deep.equal([
      "ADDIU SP SP -32",
      "SW RA 24(SP)",
      "NOP",
      "BEQ V0 R0 2",
      "JAL 0x80023456",
      "NOP",
      "LW RA 24(SP)",
      "JR RA",
      "ADDIU SP SP 32",
    ]);
  });

  it("does infinite loop", () => {
    expect(assemble(`
      .org 0x80004000
      main:
      BEQ R0 R0 main
      NOP
    `, { text: true })).to.deep.equal([
      "BEQ R0 R0 -1",
      "NOP",
    ]);
  });

  it("strips comments", () => {
    expect(assemble(`
      ; my initial comment
      // Another one
      .org 0x80004000
      main: ;why not here?
      ADDIU SP SP -32 ; Trailing an instruction
      SW RA 24(SP)// store RA
      loop:
      JAL 0x80023456
      NOP
      BEQ V0 R0 loop
      NOP
      LW RA 24(SP)
      JR RA
      ADDIU SP SP 32
      ; end comment
    `, { text: true })).to.deep.equal([
      "ADDIU SP SP -32",
      "SW RA 24(SP)",
      "JAL 0x80023456",
      "NOP",
      "BEQ V0 R0 -3",
      "NOP",
      "LW RA 24(SP)",
      "JR RA",
      "ADDIU SP SP 32",
    ]);
  });

  it("does definelabel", () => {
    expect(assemble(`
      .org 0x80004000
      .definelabel ExternalLibFn,0x80023456
      JAL ExternalLibFn
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "NOP",
    ]);
  });

  it("handles hi/lo", () => {
    expect(assemble(`
      .org 0x80004000
      .definelabel ExternalLibFn,0x80023456
      LUI A0 hi(ExternalLibFn)
      ADDIU A0 A0 lo(ExternalLibFn)
    `, { text: true })).to.deep.equal([
      "LUI A0 0x8002",
      "ADDIU A0 A0 0x3456",
    ]);

    expect(assemble(`
      .org 0x80004000
      .definelabel ExternalLibFn,0x8002C456
      LUI A0 hi(ExternalLibFn)
      ADDIU A0 A0 lo(ExternalLibFn)
    `, { text: true })).to.deep.equal([
      "LUI A0 0x8003",
      "ADDIU A0 A0 0xC456",
    ]);
  });
});
