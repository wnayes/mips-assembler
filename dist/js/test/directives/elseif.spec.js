import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".elseif", function () {
    it("executes if an if condition was false", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .if 0\n      LUI A0 0x3F\n      LH A0 0(V0)\n      .elseif 2\n      ADDIU V0 R0 10\n      .endif\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "LW T0 0(GP)",
            "JAL 0x12344",
            "NOP",
            "ADDIU V0 R0 0xA",
            "JR RA",
            "NOP",
        ]);
    });
    it("doesn't execute if an if condition was true", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .if 1\n      LUI A0 0x3F\n      LH A0 0(V0)\n      .elseif 2\n      ADDIU V0 R0 10\n      .endif\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "LW T0 0(GP)",
            "JAL 0x12344",
            "NOP",
            "LUI A0 0x3F",
            "LH A0 0(V0)",
            "JR RA",
            "NOP",
        ]);
    });
    it("supports nesting", function () {
        expect(print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .if 0\n        NOP\n      .elseif 1\n        LUI A0 0x3F\n        .if 1\n          LH A0 0(V0)\n        .elseif 1\n          NOP\n        .endif\n      .else\n        ADDIU V0 R0 10\n      .endif\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "LW T0 0(GP)",
            "JAL 0x12344",
            "NOP",
            "LUI A0 0x3F",
            "LH A0 0(V0)",
            "JR RA",
            "NOP",
        ]);
    });
    it("seeing an elseif after an else causes an error", function () {
        expect(function () { return print(assemble("\n      LW T0 0(GP)\n      JAL 0x80012344\n      NOP\n      .if 0\n      LUI A0 0x3F\n      .else\n      LH A0 0(V0)\n      .elseif 2\n      ADDIU V0 R0 10\n      .endif\n      JR RA\n      NOP\n    ")); }).to.throw();
    });
});
