import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".if", function () {
    it("allows a region to be assembled if the condition is true", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      LUI A0 0x3F\n      .if 1\n      LH A0 0(V0)\n      ADDIU V0 R0 10\n      .endif\n      JR RA\n      NOP\n    "))).to.deep.equal([
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
    it("prevents a region from being output if the condition is false", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      LUI A0 0x3F\n      .if 0\n      LH A0 0(V0)\n      ADDIU V0 R0 10\n      .endif\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "LW T0 0(GP)",
            "JAL 0x12344",
            "NOP",
            "LUI A0 0x3F",
            "JR RA",
            "NOP",
        ]);
    });
    it("supports nested ifs", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      LUI A0 0x3F\n      .if 1\n      LH A0 0(V0)\n      .if 1\n      ADDIU V0 R0 10\n      .endif\n      .endif\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "LW T0 0(GP)",
            "JAL 0x12344",
            "NOP",
            "LUI A0 0x3F",
            "LH A0 0(V0)",
            "ADDIU V0 R0 0xA",
            "JR RA",
            "NOP",
        ]);
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      LUI A0 0x3F\n      .if 1\n      LH A0 0(V0)\n      .if 0\n      ADDIU V0 R0 10\n      .endif\n      .endif\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "LW T0 0(GP)",
            "JAL 0x12344",
            "NOP",
            "LUI A0 0x3F",
            "LH A0 0(V0)",
            "JR RA",
            "NOP",
        ]);
    });
    it("evaluates the condition from a label", function () {
        expect(print(assemble("\n      .definelabel truthy,100\n      .if truthy\n      LH A0 0(V0)\n      ADDIU V0 R0 10\n      .endif\n    "))).to.deep.equal([
            "LH A0 0(V0)",
            "ADDIU V0 R0 0xA",
        ]);
    });
    it("must have the conditional label evaluated prior to testing it", function () {
        expect(function () { return print(assemble("\n      .if truthy\n      LH A0 0(V0)\n      ADDIU V0 R0 10\n      .endif\n      .definelabel truthy,100\n    ")); }).to.throw();
    });
});
