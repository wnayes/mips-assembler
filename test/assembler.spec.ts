import "mocha";
import { expect } from "chai";

import { assemble } from "../src/assembler";

describe("Assembler", () => {
  it("does basic loop", () => {
    expect(assemble(`
      .org 0x80004000
      main:
      ADDIU SP SP -0x20
      SW RA 24(SP)
      loop:
      JAL 0x80023456
      NOP
      BEQ V0 R0 loop
      NOP
      LW RA 24(SP)
      JR RA
      ADDIU SP SP 0x20
    `, { text: true })).to.deep.equal([
      "ADDIU SP SP -0x20",
      "SW RA 24(SP)",
      "JAL 0x80023456",
      "NOP",
      "BEQ V0 R0 -0x3",
      "NOP",
      "LW RA 24(SP)",
      "JR RA",
      "ADDIU SP SP 0x20",
    ]);
  });

  it("does branch forward", () => {
    expect(assemble(`
      .org 0x80004000
      main:
      ADDIU SP SP -0x20
      SW RA 24(SP)
      NOP
      BEQ V0 R0 skip
      JAL 0x80023456
      NOP
      skip:
      LW RA 24(SP)
      JR RA
      ADDIU SP SP 0x20
    `, { text: true })).to.deep.equal([
      "ADDIU SP SP -0x20",
      "SW RA 24(SP)",
      "NOP",
      "BEQ V0 R0 0x2",
      "JAL 0x80023456",
      "NOP",
      "LW RA 24(SP)",
      "JR RA",
      "ADDIU SP SP 0x20",
    ]);
  });

  it("does infinite loop", () => {
    expect(assemble(`
      .org 0x80004000
      main:
      BEQ R0 R0 main
      NOP
    `, { text: true })).to.deep.equal([
      "BEQ R0 R0 -0x1",
      "NOP",
    ]);
  });

  it("strips comments", () => {
    expect(assemble(`
      ; my initial comment
      // Another one
      .org 0x80004000
      main: ;why not here?
      ADDIU SP SP -0x20 ; Trailing an instruction
      SW RA 24(SP)// store RA
      loop:
      JAL 0x80023456
      NOP
      BEQ V0 R0 loop
      NOP
      LW RA 24(SP)
      JR RA
      ADDIU SP SP 0x20
      ; end comment
    `, { text: true })).to.deep.equal([
      "ADDIU SP SP -0x20",
      "SW RA 24(SP)",
      "JAL 0x80023456",
      "NOP",
      "BEQ V0 R0 -0x3",
      "NOP",
      "LW RA 24(SP)",
      "JR RA",
      "ADDIU SP SP 0x20",
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

    expect(assemble(`
      .org 0x80004000
      LUI A1 hi(lbl)
      ADDIU A1 A1 lo(lbl)
      lbl:
      .ascii "Some text"
    `, { text: true })).to.deep.equal([
      "LUI A1 0x8000",
      "ADDIU A1 A1 0x4008",
    ]);
  });

  it("handles hi/lo in relative memory lookup location", () => {
    expect(assemble(`
      .org 0x80004000
      .definelabel ExternalLoc,0x80023456
      LUI V0, hi(ExternalLoc)
      LHU V0, lo(ExternalLoc)(V0)
    `, { text: true })).to.deep.equal([
      "LUI V0 0x8002",
      "LHU V0 13398(V0)", // 0x3456
    ]);
  });

  describe("labels", () => {
    it("handles labels on the same line as instructions", () => {
      expect(assemble(`
        .org 0x80004000
        main:ADDIU SP SP -0x20
        SW RA 24(SP)
        loop: JAL 0x80023456
        NOP
        BEQ V0 R0 loop
        NOP
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
      `, { text: true })).to.deep.equal([
        "ADDIU SP SP -0x20",
        "SW RA 24(SP)",
        "JAL 0x80023456",
        "NOP",
        "BEQ V0 R0 -0x3",
        "NOP",
        "LW RA 24(SP)",
        "JR RA",
        "ADDIU SP SP 0x20",
      ]);
    });

    it("handles multiple labels on the same line", () => {
      expect(assemble(`
        .org 0x80004000
        main:start:ADDIU SP SP -0x20
        SW RA 24(SP)
        loop: repeat:
        JAL 0x80023456
        NOP
        BEQ V0 R0 loop
        NOP
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
      `, { text: true })).to.deep.equal([
        "ADDIU SP SP -0x20",
        "SW RA 24(SP)",
        "JAL 0x80023456",
        "NOP",
        "BEQ V0 R0 -0x3",
        "NOP",
        "LW RA 24(SP)",
        "JR RA",
        "ADDIU SP SP 0x20",
      ]);
    });

    it("handles ending labels", () => {
      expect(assemble(`
        .org 0x80004000
        main:
        ADDIU SP SP -0x20
        SW RA 24(SP)
        loop: JAL 0x80023456
        NOP
        BEQ V0 R0 loop
        NOP
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        end:
      `, { text: true })).to.deep.equal([
        "ADDIU SP SP -0x20",
        "SW RA 24(SP)",
        "JAL 0x80023456",
        "NOP",
        "BEQ V0 R0 -0x3",
        "NOP",
        "LW RA 24(SP)",
        "JR RA",
        "ADDIU SP SP 0x20",
      ]);
    });

    it("handles '?'", () => {
      expect(assemble(`
        .org 0x80004000
        main:
        ADDIU SP SP -0x20
        SW RA 24(SP)
        loop?: JAL 0x80023456
        NOP
        BEQ V0 R0 loop?
        NOP
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        end:
      `, { text: true })).to.deep.equal([
        "ADDIU SP SP -0x20",
        "SW RA 24(SP)",
        "JAL 0x80023456",
        "NOP",
        "BEQ V0 R0 -0x3",
        "NOP",
        "LW RA 24(SP)",
        "JR RA",
        "ADDIU SP SP 0x20",
      ]);
    });

    it("handles '!'", () => {
      expect(assemble(`
        .org 0x80004000
        main:
        ADDIU SP SP -0x20
        SW RA 24(SP)
        loop!: JAL 0x80023456
        NOP
        BEQ V0 R0 loop!
        NOP
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        end:
      `, { text: true })).to.deep.equal([
        "ADDIU SP SP -0x20",
        "SW RA 24(SP)",
        "JAL 0x80023456",
        "NOP",
        "BEQ V0 R0 -0x3",
        "NOP",
        "LW RA 24(SP)",
        "JR RA",
        "ADDIU SP SP 0x20",
      ]);
    });

    it("handles underscores", () => {
      expect(assemble(`
        .org 0x80004000
        main_2:
        ADDIU SP SP -0x20
        SW RA 24(SP)
        __loop: JAL 0x80023456
        NOP
        BEQ V0 R0 __loop
        NOP
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        end:
      `, { text: true })).to.deep.equal([
        "ADDIU SP SP -0x20",
        "SW RA 24(SP)",
        "JAL 0x80023456",
        "NOP",
        "BEQ V0 R0 -0x3",
        "NOP",
        "LW RA 24(SP)",
        "JR RA",
        "ADDIU SP SP 0x20",
      ]);
    });
  });

  describe("local labels", () => {
    it("handles local labels", () => {
      expect(assemble(`
        .org 0x80004000
        main_2:
        ADDIU SP SP -0x20
        SW RA 24(SP)
        @@loop: JAL 0x80023456
        NOP
        BEQ V0 R0 @@loop
        NOP
        exit:
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        end:
      `, { text: true })).to.deep.equal([
        "ADDIU SP SP -0x20",
        "SW RA 24(SP)",
        "JAL 0x80023456",
        "NOP",
        "BEQ V0 R0 -0x3",
        "NOP",
        "LW RA 24(SP)",
        "JR RA",
        "ADDIU SP SP 0x20",
      ]);
    });

    it("throws an error if local labels are used in an invalid area", () => {
      expect(() => {
        assemble(`
        .org 0x80004000
        main_2:
        ADDIU SP SP -0x20
        SW RA 24(SP)
        @@loop: JAL 0x80023456
        NOP
        BEQ V0 R0 @@loop
        NOP
        exit:
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        BEQ R0 R0 @@loop ; cannot be used in the exit region
        end:
      `, { text: true });
      }).to.throw();
    });

    it("throws an error if local labels are used before any global label", () => {
      expect(() => {
        assemble(`
        .org 0x80004000
        @@localstart:
        main_2:
        ADDIU SP SP -0x20
        SW RA 24(SP)
        @@loop: JAL 0x80023456
        NOP
        BEQ V0 R0 @@loop
        NOP
        exit:
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        BEQ R0 R0 @@loop ; cannot be used in the exit region
        end:
      `, { text: true });
      }).to.throw("Local label @@localstart (starts with @@) cannot be used before a global label");
    });
  });
});
