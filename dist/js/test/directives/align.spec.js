import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".align", function () {
    it("writes zeroes to align the buffer", function () {
        expect(print(assemble("\n      ADDU A0 A2 R0\n      JR RA\n      NOP\n      .align 32\n      LUI A0 0x3F\n      LH A0 0(V0)\n    "))).to.deep.equal([
            "ADDU A0 A2 R0",
            "JR RA",
            "NOP",
            "NOP",
            "NOP",
            "NOP",
            "NOP",
            "NOP",
            "LUI A0 0x3F",
            "LH A0 0(V0)",
        ]);
    });
    it("does nothing if already aligned", function () {
        expect(print(assemble("\n      ADDU A0 A2 R0\n      .align 4\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "ADDU A0 A2 R0",
            "JR RA",
            "NOP",
        ]);
    });
    it("throws an exception for negative alignment", function () {
        expect(function () {
            print(assemble("\n        ADDU A0 A2 R0\n        .align -4\n        JR RA\n        NOP\n      "));
        }).to.throw(".align directive cannot align by a negative value.");
    });
    it("throws an exception for non-power-of-two alignment", function () {
        expect(function () {
            print(assemble("\n        ADDU A0 A2 R0\n        .align 3\n        JR RA\n        NOP\n      "));
        }).to.throw(".align directive requires a power of two.");
    });
});
