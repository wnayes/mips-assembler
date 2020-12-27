import "mocha";
import { expect } from "chai";
import { assemble } from "../src/assembler";
import { it } from "mocha";
describe("Assembler", function () {
    it("does basic loop", function () {
        expect(assemble("\n      .org 0x80004000\n      main:\n      ADDIU SP SP -0x20\n      SW RA 24(SP)\n      loop:\n      JAL 0x80023456\n      NOP\n      BEQ V0 R0 loop\n      NOP\n      LW RA 24(SP)\n      JR RA\n      ADDIU SP SP 0x20\n    ", { text: true })).to.deep.equal([
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
    it("does branch forward", function () {
        expect(assemble("\n      .org 0x80004000\n      main:\n      ADDIU SP SP -0x20\n      SW RA 24(SP)\n      NOP\n      BEQ V0 R0 skip\n      JAL 0x80023456\n      NOP\n      skip:\n      LW RA 24(SP)\n      JR RA\n      ADDIU SP SP 0x20\n    ", { text: true })).to.deep.equal([
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
    it("does infinite loop", function () {
        expect(assemble("\n      .org 0x80004000\n      main:\n      BEQ R0 R0 main\n      NOP\n    ", { text: true })).to.deep.equal([
            "BEQ R0 R0 -0x1",
            "NOP",
        ]);
    });
    describe("strips comments", function () {
        it("strips semicolon comments", function () {
            expect(assemble("\n        ; my initial comment\n; Another one\n        .org 0x80004000\n        main: ;why not here?\n        ADDIU SP SP -0x20 ; Trailing an instruction\n        SW RA 24(SP); store RA\n        loop:\n        JAL 0x80023456\n        NOP\n        BEQ V0 R0 loop ;; love it ;\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        ; end comment\n      ", { text: true })).to.deep.equal([
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
        it("strips double slash comments", function () {
            expect(assemble("\n        // my initial comment\n// Another one\n        .org 0x80004000\n        main: //why not here?\n        ADDIU SP SP -0x20 // Trailing an instruction\n        SW RA 24(SP)// store RA\n        loop:\n        JAL 0x80023456\n        NOP\n        BEQ V0 R0 loop //// great stuff\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        // end comment\n      ", { text: true })).to.deep.equal([
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
        it("strips block comments", function () {
            expect(assemble("\n        /* my initial comment */\n/* Another one */\n        .org 0x80004000\n        main: /*why not here?*/\n        ADDIU SP SP -0x20 /* Trailing an instruction */\n        SW RA 24(SP)/* store RA*/\n        loop:\n        JAL 0x80023456 /**/\n        /* NOP */ NOP\n        BEQ V0 R0 loop /* A loop! */ /* Not done yet, more comments! */\n        NOP\n        LW RA 24(SP)\n        JR /* return!*/ RA\n        ADDIU SP SP 0x20\n        /* end comment */\n      ", { text: true })).to.deep.equal([
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
        it("strips multi-line block comments", function () {
            expect(assemble("\n        /* my initial comment\nContinues on... */\n        .org 0x80004000\n        main:\n        ADDIU SP SP -0x20 /* Don't store RA lol\n        SW RA 24(SP)/* store RA*/\n        loop:\n        JAL 0x80023456\n        NOP\n        BEQ V0 R0 loop\n        /*\n         * Elaborate comment about delay slots\n         */\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        /*\n         * Even though my code is done,\n         * I feel compelled to write more here.\n         */\n      ", { text: true })).to.deep.equal([
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
        it("handles semicolon characters within strings", function () {
            var buffer = new ArrayBuffer(12);
            assemble("\n        .ascii \"t;st\"\n        .ascii ';bcdefg;' ; trailing\n      ", { buffer: buffer });
            var dataView = new DataView(buffer);
            expect(dataView.getUint32(0)).to.equal(0x743B7374); // "t;st"
            expect(dataView.getUint32(4)).to.equal(0x3B626364); // ";bcd"
            expect(dataView.getUint32(8)).to.equal(0x6566673B); // "efg;"
        });
        it("handles slash characters within strings", function () {
            var buffer = new ArrayBuffer(12);
            assemble("\n        .ascii \"t//t\"\n        .ascii '//cdefgh' // trailing\n      ", { buffer: buffer });
            var dataView = new DataView(buffer);
            expect(dataView.getUint32(0)).to.equal(0x742F2F74); // "t//t"
            expect(dataView.getUint32(4)).to.equal(0x2F2F6364); // "//cd"
            expect(dataView.getUint32(8)).to.equal(0x65666768); // "efgh"
        });
        it("handles block comments characters within strings", function () {
            var buffer = new ArrayBuffer(12);
            assemble("\n        .ascii \"/**/\"\n        .ascii '/*cdefgh' /* trailing */\n      ", { buffer: buffer });
            var dataView = new DataView(buffer);
            expect(dataView.getUint32(0)).to.equal(0x2F2A2A2F); // "/**/"
            expect(dataView.getUint32(4)).to.equal(0x2F2A6364); // "//cd"
            expect(dataView.getUint32(8)).to.equal(0x65666768); // "efgh"
        });
        it("block quote can obscure ascii directive parameters", function () {
            var buffer = new ArrayBuffer(12);
            assemble("\n        .ascii /*\"test\"*/ \"abcd\"\n        .ascii 'abcdefgh'\n      ", { buffer: buffer });
            var dataView = new DataView(buffer);
            expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
            expect(dataView.getUint32(4)).to.equal(0x61626364); // "abcd"
            expect(dataView.getUint32(8)).to.equal(0x65666768); // "efgh"
        });
        // Until quote check is more robust, this fails.
        xit("handles block quotes nestled between ascii parameters", function () {
            var buffer = new ArrayBuffer(8);
            assemble("\n        .ascii \"test\" /* then comes...*/ \"abcd\"\n      ", { buffer: buffer });
            var dataView = new DataView(buffer);
            expect(dataView.getUint32(0)).to.equal(0x74657374); // "test"
            expect(dataView.getUint32(4)).to.equal(0x61626364); // "abcd"
        });
    });
    it("handles hi/lo", function () {
        expect(assemble("\n      .org 0x80004000\n      .definelabel ExternalLibFn,0x80023456\n      LUI A0 hi(ExternalLibFn)\n      ADDIU A0 A0 lo(ExternalLibFn)\n    ", { text: true })).to.deep.equal([
            "LUI A0 0x8002",
            "ADDIU A0 A0 0x3456",
        ]);
        expect(assemble("\n      .org 0x80004000\n      .definelabel ExternalLibFn,0x8002C456\n      LUI A0 hi(ExternalLibFn)\n      ADDIU A0 A0 lo(ExternalLibFn)\n    ", { text: true })).to.deep.equal([
            "LUI A0 0x8003",
            "ADDIU A0 A0 0xC456",
        ]);
        expect(assemble("\n      .org 0x80004000\n      LUI A1 hi(lbl)\n      ADDIU A1 A1 lo(lbl)\n      lbl:\n      .ascii \"Some text\"\n    ", { text: true })).to.deep.equal([
            "LUI A1 0x8000",
            "ADDIU A1 A1 0x4008",
        ]);
    });
    it("handles hi/lo in relative memory lookup location", function () {
        expect(assemble("\n      .org 0x80004000\n      .definelabel ExternalLoc,0x80023456\n      LUI V0, hi(ExternalLoc)\n      LHU V0, lo(ExternalLoc)(V0)\n    ", { text: true })).to.deep.equal([
            "LUI V0 0x8002",
            "LHU V0 13398(V0)",
        ]);
    });
    describe("labels", function () {
        it("handles labels on the same line as instructions", function () {
            expect(assemble("\n        .org 0x80004000\n        main:ADDIU SP SP -0x20\n        SW RA 24(SP)\n        loop: JAL 0x80023456\n        NOP\n        BEQ V0 R0 loop\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n      ", { text: true })).to.deep.equal([
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
        it("handles labels on same line as directives", function () {
            var buffer = assemble("\n        .org 0x80000000\n        test_label: .word 0, 0\n        test_label2: .word 0, 0, 0\n      ");
            expect(buffer.byteLength).to.equal(20);
        });
        it("handles multiple labels on the same line", function () {
            expect(assemble("\n        .org 0x80004000\n        main:start:ADDIU SP SP -0x20\n        SW RA 24(SP)\n        loop: repeat:\n        JAL 0x80023456\n        NOP\n        BEQ V0 R0 loop\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n      ", { text: true })).to.deep.equal([
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
        it("handles ending labels", function () {
            expect(assemble("\n        .org 0x80004000\n        main:\n        ADDIU SP SP -0x20\n        SW RA 24(SP)\n        loop: JAL 0x80023456\n        NOP\n        BEQ V0 R0 loop\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        end:\n      ", { text: true })).to.deep.equal([
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
        it("handles '?'", function () {
            expect(assemble("\n        .org 0x80004000\n        main:\n        ADDIU SP SP -0x20\n        SW RA 24(SP)\n        loop?: JAL 0x80023456\n        NOP\n        BEQ V0 R0 loop?\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        end:\n      ", { text: true })).to.deep.equal([
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
        it("handles '!'", function () {
            expect(assemble("\n        .org 0x80004000\n        main:\n        ADDIU SP SP -0x20\n        SW RA 24(SP)\n        loop!: JAL 0x80023456\n        NOP\n        BEQ V0 R0 loop!\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        end:\n      ", { text: true })).to.deep.equal([
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
        it("handles underscores", function () {
            expect(assemble("\n        .org 0x80004000\n        main_2:\n        ADDIU SP SP -0x20\n        SW RA 24(SP)\n        __loop: JAL 0x80023456\n        NOP\n        BEQ V0 R0 __loop\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        end:\n      ", { text: true })).to.deep.equal([
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
        it("handles labels with leading numbers", function () {
            expect(assemble("\n        .org 0x80004000\n        main_2:\n        ADDIU SP SP -0x20\n        SW RA 24(SP)\n        123lbl: JAL 0x80023456\n        NOP\n        BEQ V0 R0 123lbl\n        NOP\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        end:\n      ", { text: true })).to.deep.equal([
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
    describe("local labels", function () {
        it("handles local labels", function () {
            expect(assemble("\n        .org 0x80004000\n        main_2:\n        ADDIU SP SP -0x20\n        SW RA 24(SP)\n        @@loop: JAL 0x80023456\n        NOP\n        BEQ V0 R0 @@loop\n        NOP\n        exit:\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        end:\n      ", { text: true })).to.deep.equal([
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
        it("throws an error if local labels are used in an invalid area", function () {
            expect(function () {
                assemble("\n        .org 0x80004000\n        main_2:\n        ADDIU SP SP -0x20\n        SW RA 24(SP)\n        @@loop: JAL 0x80023456\n        NOP\n        BEQ V0 R0 @@loop\n        NOP\n        exit:\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        BEQ R0 R0 @@loop ; cannot be used in the exit region\n        end:\n      ", { text: true });
            }).to.throw();
        });
        it("throws an error if local labels are used before any global label", function () {
            expect(function () {
                assemble("\n        .org 0x80004000\n        @@localstart:\n        main_2:\n        ADDIU SP SP -0x20\n        SW RA 24(SP)\n        @@loop: JAL 0x80023456\n        NOP\n        BEQ V0 R0 @@loop\n        NOP\n        exit:\n        LW RA 24(SP)\n        JR RA\n        ADDIU SP SP 0x20\n        BEQ R0 R0 @@loop ; cannot be used in the exit region\n        end:\n      ", { text: true });
            }).to.throw("Local label @@localstart (starts with @@) cannot be used before a global label");
        });
    });
    describe("symbolOutputMap", function () {
        it("records the correct output indices", function () {
            var opts = {
                symbolOutputMap: Object.create(null)
            };
            assemble("\n        .org 0x80004000\n        main:start:ADDIU SP SP -0x20\n        SW RA 24(SP)\n        loop: repeat:\n        JAL 0x80023456\n        NOP\n        @@insideloopforsomereason:\n        BEQ V0 R0 loop\n        NOP\n        LW RA 24(SP)\n        end:\n        JR RA\n        ADDIU SP SP 0x20\n      ", opts);
            expect(opts.symbolOutputMap).to.deep.equal({
                main: 0,
                start: 0,
                loop: 8,
                repeat: 8,
                end: 28
            });
        });
        it("is not populated if not passed", function () {
            var opts = {};
            assemble("\n        .org 0x80004000\n        main:start:ADDIU SP SP -0x20\n        SW RA 24(SP)\n        loop: repeat:\n        NOP\n      ", opts);
            expect(opts.symbolOutputMap).to.be.undefined;
        });
    });
    it("handles negative relative offset from register", function () {
        expect(assemble("\n      SH R0, -6(V0)\n    ", { text: true })).to.deep.equal([
            "SH R0 -6(V0)",
        ]);
    });
    it("throws if a branch is misaligned", function () {
        expect(function () { return assemble("\n      .org 0x80004000\n      main:\n      ADDIU SP SP -0x20\n      SW RA 24(SP)\n      .byte 1\n      loop:\n      JAL 0x80023456\n      .align 4\n      NOP\n      BEQ V0 R0 loop\n      NOP\n      LW RA 24(SP)\n      JR RA\n      ADDIU SP SP 0x20\n    "); }).to.throw();
    });
});
