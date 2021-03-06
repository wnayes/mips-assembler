import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".skip", function () {
    it("passes over existing bytes", function () {
        var buffer = new ArrayBuffer(32);
        var dataView = new DataView(buffer);
        dataView.setUint32(12, 0x0C);
        dataView.setUint32(16, 0x0C);
        dataView.setUint32(20, 0x0C);
        expect(print(assemble("\n      ADDU A0 A2 R0\n      JR RA\n      NOP\n      .skip 12\n      LUI A0 0x3F\n      LH A0 0(V0)\n    ", { buffer: buffer }))).to.deep.equal([
            "ADDU A0 A2 R0",
            "JR RA",
            "NOP",
            "SYSCALL",
            "SYSCALL",
            "SYSCALL",
            "LUI A0 0x3F",
            "LH A0 0(V0)",
        ]);
    });
    it("throws an exception for negative skips", function () {
        expect(function () {
            print(assemble("\n        ADDU A0 A2 R0\n        JR RA\n        NOP\n        .skip -12\n        LUI A0 0x3F\n        LH A0 0(V0)\n      "));
        }).to.throw(".skip directive cannot skip a negative length.");
    });
});
