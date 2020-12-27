import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
var aliases = ["halfword", "dh"];
aliases.forEach(function (alias) {
    describe("." + alias, function () {
        it("writes the given 16-bit values to the buffer", function () {
            var buffer = new ArrayBuffer(4);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 0x1234,22136\n      ", { buffer: buffer });
            expect(dataView.getUint16(0)).to.equal(0x1234);
            expect(dataView.getUint16(2)).to.equal(0x5678);
        });
        it("handles single halfword", function () {
            var buffer = new ArrayBuffer(2);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 0x1234\n      ", { buffer: buffer });
            expect(dataView.getUint16(0)).to.equal(0x1234);
        });
        it("handles spaces", function () {
            var buffer = new ArrayBuffer(8);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 0x1234, 0x4567,     0x10, 128\n      ", { buffer: buffer });
            expect(dataView.getUint16(0)).to.equal(0x1234);
            expect(dataView.getUint16(2)).to.equal(0x4567);
            expect(dataView.getUint16(4)).to.equal(0x10);
            expect(dataView.getUint16(6)).to.equal(128);
        });
        it("leaves only the lower 16 bits", function () {
            var buffer = new ArrayBuffer(4);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 0x12345678,0xA0010\n      ", { buffer: buffer });
            expect(dataView.getUint16(0)).to.equal(0x5678);
            expect(dataView.getUint16(2)).to.equal(0x10);
        });
        it("preserves signed numbers", function () {
            var buffer = new ArrayBuffer(6);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " -256,-1,-90000\n      ", { buffer: buffer });
            expect(dataView.getInt16(0)).to.equal(-256);
            expect(dataView.getInt16(2)).to.equal(-1);
            expect(dataView.getInt16(4)).to.equal(-24464);
        });
        it("preserves unsigned numbers", function () {
            var buffer = new ArrayBuffer(6);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 65535,257,90000\n      ", { buffer: buffer });
            expect(dataView.getUint16(0)).to.equal(65535);
            expect(dataView.getUint16(2)).to.equal(257);
            expect(dataView.getUint16(4)).to.equal(24464);
        });
        it("supports labels as values", function () {
            var buffer = new ArrayBuffer(6);
            var dataView = new DataView(buffer);
            assemble("\n        .org 0x80123456\n        .definelabel pos,0x1234\n        .definelabel neg,-256\n        the_word!:\n        ." + alias + " pos,neg,the_word!\n      ", { buffer: buffer });
            expect(dataView.getUint16(0)).to.equal(0x1234);
            expect(dataView.getInt16(2)).to.equal(-256);
            expect(dataView.getUint16(4)).to.equal(0x3456);
        });
        it("supports expressions as values", function () {
            var buffer = new ArrayBuffer(4);
            var dataView = new DataView(buffer);
            assemble("\n        .org 0x80123456\n        .definelabel pos,0x1F2F3F00\n        the_word!:\n        ." + alias + " lo(pos), hi(the_word!)\n      ", { buffer: buffer });
            expect(dataView.getUint16(0)).to.equal(0x3F00);
            expect(dataView.getUint16(2)).to.equal(0x8012);
        });
    });
});
