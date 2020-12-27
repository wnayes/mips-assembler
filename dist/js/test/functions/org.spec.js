import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
describe("org()", function () {
    it("outputs the current memory address into the output", function () {
        var buffer = new ArrayBuffer(12);
        var dataView = new DataView(buffer);
        assemble("\n      .word org()\n      .byte org()\n      .align 4\n      LUI A0 org()\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0);
        expect(dataView.getUint8(4)).to.equal(4);
        expect(dataView.getUint32(8)).to.equal(0x3C040008); // LUI A0 8
    });
});
