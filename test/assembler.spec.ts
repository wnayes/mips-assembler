import "mocha";
import { expect } from "chai";

import { assemble, IAssembleOpts } from "../src/assembler";
import { it } from "mocha";

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

  describe("strips comments", () => {
    it("strips semicolon comments", () => {
      expect(assemble(`
        ; my initial comment
; Another one
        .org 0x80004000
        main: ;why not here?
        ADDIU SP SP -0x20 ; Trailing an instruction
        SW RA 24(SP); store RA
        loop:
        JAL 0x80023456
        NOP
        BEQ V0 R0 loop ;; love it ;
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

    it("strips double slash comments", () => {
      expect(assemble(`
        // my initial comment
// Another one
        .org 0x80004000
        main: //why not here?
        ADDIU SP SP -0x20 // Trailing an instruction
        SW RA 24(SP)// store RA
        loop:
        JAL 0x80023456
        NOP
        BEQ V0 R0 loop //// great stuff
        NOP
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        // end comment
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

    it("strips block comments", () => {
      expect(assemble(`
        /* my initial comment */
/* Another one */
        .org 0x80004000
        main: /*why not here?*/
        ADDIU SP SP -0x20 /* Trailing an instruction */
        SW RA 24(SP)/* store RA*/
        loop:
        JAL 0x80023456 /**/
        /* NOP */ NOP
        BEQ V0 R0 loop /* A loop! */ /* Not done yet, more comments! */
        NOP
        LW RA 24(SP)
        JR /* return!*/ RA
        ADDIU SP SP 0x20
        /* end comment */
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

    it("strips multi-line block comments", () => {
      expect(assemble(`
        /* my initial comment
Continues on... */
        .org 0x80004000
        main:
        ADDIU SP SP -0x20 /* Don't store RA lol
        SW RA 24(SP)/* store RA*/
        loop:
        JAL 0x80023456
        NOP
        BEQ V0 R0 loop
        /*
         * Elaborate comment about delay slots
         */
        NOP
        LW RA 24(SP)
        JR RA
        ADDIU SP SP 0x20
        /*
         * Even though my code is done,
         * I feel compelled to write more here.
         */
      `, { text: true })).to.deep.equal([
        "ADDIU SP SP -0x20",
        "JAL 0x80023456",
        "NOP",
        "BEQ V0 R0 -0x3",
        "NOP",
        "LW RA 24(SP)",
        "JR RA",
        "ADDIU SP SP 0x20",
      ]);
    });

    it("handles semicolon characters within strings", () => {
      const buffer = new ArrayBuffer(12);
      assemble(`
        .ascii "t;st"
        .ascii ';bcdefg;' ; trailing
      `, { buffer });

      const dataView = new DataView(buffer);
      expect(dataView.getUint32(0)).to.equal(0x743B7374); // "t;st"
      expect(dataView.getUint32(4)).to.equal(0x3B626364); // ";bcd"
      expect(dataView.getUint32(8)).to.equal(0x6566673B); // "efg;"
    });

    it("handles slash characters within strings", () => {
      const buffer = new ArrayBuffer(12);
      assemble(`
        .ascii "t//t"
        .ascii '//cdefgh' // trailing
      `, { buffer });

      const dataView = new DataView(buffer);
      expect(dataView.getUint32(0)).to.equal(0x742F2F74); // "t//t"
      expect(dataView.getUint32(4)).to.equal(0x2F2F6364); // "//cd"
      expect(dataView.getUint32(8)).to.equal(0x65666768); // "efgh"
    });

    it("handles block comments characters within strings", () => {
      const buffer = new ArrayBuffer(12);
      assemble(`
        .ascii "/**/"
        .ascii '/*cdefgh' /* trailing */
      `, { buffer });

      const dataView = new DataView(buffer);
      expect(dataView.getUint32(0)).to.equal(0x2F2A2A2F); // "/**/"
      expect(dataView.getUint32(4)).to.equal(0x2F2A6364); // "//cd"
      expect(dataView.getUint32(8)).to.equal(0x65666768); // "efgh"
    });

    it("block quote can obscure ascii directive parameters", () => {
      const buffer = new ArrayBuffer(12);
      assemble(`
        .ascii /*"test"*/ "abcd"
        .ascii 'abcdefgh'
      `, { buffer });

      const dataView = new DataView(buffer);
      expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
      expect(dataView.getUint32(4)).to.equal(0x61626364); // "abcd"
      expect(dataView.getUint32(8)).to.equal(0x65666768); // "efgh"
    });

    // Until quote check is more robust, this fails.
    xit("handles block quotes nestled between ascii parameters", () => {
      const buffer = new ArrayBuffer(8);
      assemble(`
        .ascii "test" /* then comes...*/ "abcd"
      `, { buffer });

      const dataView = new DataView(buffer);
      expect(dataView.getUint32(0)).to.equal(0x74657374); // "test"
      expect(dataView.getUint32(4)).to.equal(0x61626364); // "abcd"
    });
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

    it("handles labels on same line as directives", () => {
      const buffer = assemble(`
        .org 0x80000000
        test_label: .word 0, 0
        test_label2: .word 0, 0, 0
      `) as ArrayBuffer;

      expect(buffer.byteLength).to.equal(20);
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

    it("handles labels with leading numbers", () => {
      expect(assemble(`
        .org 0x80004000
        main_2:
        ADDIU SP SP -0x20
        SW RA 24(SP)
        123lbl: JAL 0x80023456
        NOP
        BEQ V0 R0 123lbl
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

  describe("symbolOutputMap", () => {
    it("records the correct output indices", () => {
      const opts = {
        symbolOutputMap: Object.create(null)
      };
      assemble(`
        .org 0x80004000
        main:start:ADDIU SP SP -0x20
        SW RA 24(SP)
        loop: repeat:
        JAL 0x80023456
        NOP
        @@insideloopforsomereason:
        BEQ V0 R0 loop
        NOP
        LW RA 24(SP)
        end:
        JR RA
        ADDIU SP SP 0x20
      `, opts);

      expect(opts.symbolOutputMap).to.deep.equal({
        main: 0,
        start: 0,
        loop: 8,
        repeat: 8,
        end: 28
      });
    });

    it("is not populated if not passed", () => {
      const opts: IAssembleOpts = {};
      assemble(`
        .org 0x80004000
        main:start:ADDIU SP SP -0x20
        SW RA 24(SP)
        loop: repeat:
        NOP
      `, opts);
      expect(opts.symbolOutputMap).to.be.undefined;
    });
  });

  it("handles negative relative offset from register", () => {
    expect(assemble(`
      SH R0, -6(V0)
    `, { text: true })).to.deep.equal([
      "SH R0 -6(V0)",
    ]);
  });

  it("throws if a branch is misaligned", () => {
    expect(() => assemble(`
      .org 0x80004000
      main:
      ADDIU SP SP -0x20
      SW RA 24(SP)
      .byte 1
      loop:
      JAL 0x80023456
      .align 4
      NOP
      BEQ V0 R0 loop
      NOP
      LW RA 24(SP)
      JR RA
      ADDIU SP SP 0x20
    `)).to.throw();
  });
});
