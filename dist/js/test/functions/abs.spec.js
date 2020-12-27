import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
describe("abs()", function () {
    it("correctly performs the absolute value operation", function () {
        var buffer = new ArrayBuffer(12);
        var dataView = new DataView(buffer);
        assemble("\n      .word abs(-1234)\n      .byte abs(-1)\n      .align 4\n      LUI A0 abs(12)\n    ", { buffer: buffer });
        expect(dataView.getInt32(0)).to.equal(1234);
        expect(dataView.getInt8(4)).to.equal(1);
        expect(dataView.getUint32(8)).to.equal(0x3C04000C); // LUI A0 12
    });
});
