import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".fill", function () {
    it("writes zeroes, by default, to the buffer", function () {
        expect(print(assemble("\n      ADDU A0 A2 R0\n      JR RA\n      NOP\n      .fill 12\n      LUI A0 0x3F\n      LH A0 0(V0)\n    "))).to.deep.equal([
            "ADDU A0 A2 R0",
            "JR RA",
            "NOP",
            "NOP",
            "NOP",
            "NOP",
            "LUI A0 0x3F",
            "LH A0 0(V0)",
        ]);
    });
    it("writes a given value to the buffer length times", function () {
        expect(print(assemble("\n      ADDU A0 A2 R0\n      .fill 3, 0\n      .fill 1, 0xC\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "ADDU A0 A2 R0",
            "SYSCALL",
            "JR RA",
            "NOP",
        ]);
    });
    it("only the lowest 8 bits of value are inserted", function () {
        expect(print(assemble("\n      ADDU A0 A2 R0\n      .fill 3, 0x23230000\n      .fill 1, 0x5456200C\n      JR RA\n      NOP\n    "))).to.deep.equal([
            "ADDU A0 A2 R0",
            "SYSCALL",
            "JR RA",
            "NOP",
        ]);
    });
    it("throws an exception for negative fill length", function () {
        expect(function () {
            print(assemble("\n        ADDU A0 A2 R0\n        .fill -4\n        JR RA\n        NOP\n      "));
        }).to.throw(".fill length must be positive.");
    });
});
