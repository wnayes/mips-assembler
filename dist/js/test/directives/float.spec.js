import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
// TODO: setFloat32/getFloat32 causes some precision issues in comparisons.
xdescribe(".float", function () {
    it("writes the given 32-bit floats to the buffer", function () {
        var buffer = new ArrayBuffer(8);
        var dataView = new DataView(buffer);
        assemble("\n      .float 123.456,0.99\n    ", { buffer: buffer });
        expect(dataView.getFloat32(0)).to.equal(123.456);
        expect(dataView.getFloat32(4)).to.equal(0.99);
    });
    it("handles single float", function () {
        var buffer = new ArrayBuffer(4);
        var dataView = new DataView(buffer);
        assemble("\n      .float .234566\n    ", { buffer: buffer });
        expect(dataView.getFloat32(0)).to.equal(0.234566);
    });
    it("handles spaces", function () {
        var buffer = new ArrayBuffer(16);
        var dataView = new DataView(buffer);
        assemble("\n      .float 12.555, .1,     .2, .0005\n    ", { buffer: buffer });
        expect(dataView.getFloat32(0)).to.equal(12.555);
        expect(dataView.getFloat32(4)).to.equal(.1);
        expect(dataView.getFloat32(8)).to.equal(.2);
        expect(dataView.getFloat32(12)).to.equal(.0005);
    });
    it("preserves signed numbers", function () {
        var buffer = new ArrayBuffer(12);
        var dataView = new DataView(buffer);
        assemble("\n      .float -256.0,-1.01,-90000.333\n    ", { buffer: buffer });
        expect(dataView.getFloat32(0)).to.equal(-256.0);
        expect(dataView.getFloat32(4)).to.equal(-1.01);
        expect(dataView.getFloat32(8)).to.equal(-90000.333);
    });
});
