import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".include", function () {
    it("includes content from the files opt", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .include \"example1\"\n      JR RA\n      NOP\n    ", {
            files: {
                example1: "\n          LUI A0 0x3F\n          LH A0 0(V0)\n          ADDIU V0 R0 10\n        "
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
    it("supports nested includes", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .include \"example1\"\n      JR RA\n      NOP\n    ", {
            files: {
                example1: ".include \"example2\"",
                example2: "\n          LUI A0 0x3F\n          LH A0 0(V0)\n          ADDIU V0 R0 10\n        "
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
    it("handles @static labels", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .include \"example1\"\n      JR RA\n      NOP\n    ", {
            files: {
                example1: "\n          LUI A0 0x3F\n          BEQ A0 R0 @end\n          LH A0 0(V0)\n          @end:\n          ADDIU V0 R0 10\n        "
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
    it("handles @static labels in directives", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .include \"example1\"\n      JR RA\n      NOP\n    ", {
            files: {
                example1: "\n          .definelabel @static_value,0x100\n          LUI A0 @static_value\n          LH A0 0(V0)\n          ADDIU V0 R0 10\n        "
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
    it("doesn't leak static labels outside of file", function () {
        expect(function () { return assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .beginfile\n      LUI A0 0x3F\n      BEQ A0 R0 @end\n      LH A0 0(V0)\n      @end:\n      ADDIU V0 R0 10\n      .endfile\n      JR RA\n      BNE R0 R0 @end\n      NOP\n    "); }).to.throw();
    });
    it("handles same static label inside multiple files", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .beginfile\n      LUI A0 0x3F\n      BEQ A0 R0 @end\n      LH A0 0(V0)\n      @end:\n      ADDIU V0 R0 10\n      .endfile\n      .beginfile\n      LUI A0 0x3F\n      BEQ A0 R0 @end\n      LH A0 0(V0)\n      @end:\n      ADDIU V0 R0 10\n      .endfile\n      JR RA\n      NOP\n    "))).to.deep.equal([
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
