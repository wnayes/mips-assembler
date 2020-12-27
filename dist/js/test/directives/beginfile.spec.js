import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".beginfile", function () {
    it("doesn't do anything special when no additional features are used", function () {
        expect(print(assemble("\n      LB S0 24(SP)\n      LW S1 0(S0)\n      .beginfile\n      ORI S2 R0 0\n      ORI S3 R0 0\n      ORI S4 R0 0\n      ORI S5 R0 0\n      .endfile\n      LW S6 0(S0)\n      BGEZ S5 done\n      LW S7 0(S6)\n      ADDU S2 S2 S7\n      BLEZ S7 neg\n      ADDU S3 S3 S7\n      J update\n    neg:\n      BGEZ S7 update\n      ADDU S4 S4 S7\n    update:\n      ADDI S5 S5 1\n      ADDI S6 S6 4\n    done:\n      JR RA\n    "))).to.deep.equal([
            "LB S0 0x18(SP)",
            "LW S1 0(S0)",
            "ORI S2 R0 0",
            "ORI S3 R0 0",
            "ORI S4 R0 0",
            "ORI S5 R0 0",
            "LW S6 0(S0)",
            "BGEZ S5 0x9",
            "LW S7 0(S6)",
            "ADDU S2 S2 S7",
            "BLEZ S7 0x2",
            "ADDU S3 S3 S7",
            "J 0x3C",
            "BGEZ S7 0x1",
            "ADDU S4 S4 S7",
            "ADDI S5 S5 0x1",
            "ADDI S6 S6 0x4",
            "JR RA",
        ]);
    });
    it("can be nested", function () {
        expect(print(assemble("\n      LB S0 24(SP)\n      LW S1 0(S0)\n      .beginfile\n      ORI S2 R0 0\n      .beginfile\n      ORI S3 R0 0\n      ORI S4 R0 0\n      .endfile\n      ORI S5 R0 0\n      .endfile\n      LW S6 0(S0)\n      BGEZ S5 done\n      LW S7 0(S6)\n      ADDU S2 S2 S7\n      BLEZ S7 neg\n      ADDU S3 S3 S7\n      J update\n    neg:\n      BGEZ S7 update\n      ADDU S4 S4 S7\n    update:\n      ADDI S5 S5 1\n      ADDI S6 S6 4\n    done:\n      JR RA\n    "))).to.deep.equal([
            "LB S0 0x18(SP)",
            "LW S1 0(S0)",
            "ORI S2 R0 0",
            "ORI S3 R0 0",
            "ORI S4 R0 0",
            "ORI S5 R0 0",
            "LW S6 0(S0)",
            "BGEZ S5 0x9",
            "LW S7 0(S6)",
            "ADDU S2 S2 S7",
            "BLEZ S7 0x2",
            "ADDU S3 S3 S7",
            "J 0x3C",
            "BGEZ S7 0x1",
            "ADDU S4 S4 S7",
            "ADDI S5 S5 0x1",
            "ADDI S6 S6 0x4",
            "JR RA",
        ]);
    });
    it("can be used adjacent to one another", function () {
        expect(print(assemble("\n      LB S0 24(SP)\n      LW S1 0(S0)\n      .beginfile\n      ORI S2 R0 0\n      .endfile\n      ORI S3 R0 0\n      ORI S4 R0 0\n      .beginfile\n      ORI S5 R0 0\n      .endfile\n      LW S6 0(S0)\n      BGEZ S5 done\n      LW S7 0(S6)\n      ADDU S2 S2 S7\n      BLEZ S7 neg\n      ADDU S3 S3 S7\n      J update\n    neg:\n      BGEZ S7 update\n      ADDU S4 S4 S7\n    update:\n      ADDI S5 S5 1\n      ADDI S6 S6 4\n    done:\n      JR RA\n    "))).to.deep.equal([
            "LB S0 0x18(SP)",
            "LW S1 0(S0)",
            "ORI S2 R0 0",
            "ORI S3 R0 0",
            "ORI S4 R0 0",
            "ORI S5 R0 0",
            "LW S6 0(S0)",
            "BGEZ S5 0x9",
            "LW S7 0(S6)",
            "ADDU S2 S2 S7",
            "BLEZ S7 0x2",
            "ADDU S3 S3 S7",
            "J 0x3C",
            "BGEZ S7 0x1",
            "ADDU S4 S4 S7",
            "ADDI S5 S5 0x1",
            "ADDI S6 S6 0x4",
            "JR RA",
        ]);
    });
    it("throws if a file is started without ending", function () {
        expect(function () { return assemble("\n      LB S0 24(SP)\n      LW S1 0(S0)\n      .beginfile\n      ORI S2 R0 0\n      .beginfile\n      ORI S3 R0 0\n      ORI S4 R0 0\n      .beginfile\n      ORI S5 R0 0\n      LW S6 0(S0)\n    "); }).to.throw();
    });
    it("scopes labels correctly", function () {
        expect(assemble("\n      .definelabel @static,1\n      .beginfile\n      .definelabel @static,0\n      .if @static\n      JAL 0x80023456\n      .endif\n      .endfile\n      .if @static\n      JAL 0x80012345\n      .endif\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80012345",
            "NOP",
        ]);
    });
    it("deeply nested label scoping", function () {
        expect(assemble("\n      .definelabel @static,1\n      .beginfile\n      .definelabel @static,0\n      .beginfile\n      .definelabel @static,1\n      .if @static\n      JAL 0x80023456\n      .endif\n      .endfile\n      .endfile\n      .if @static\n      JAL 0x80012345\n      .endif\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "JAL 0x80012345",
            "NOP",
        ]);
    });
});
