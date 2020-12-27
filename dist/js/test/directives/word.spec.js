import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
var aliases = ["word", "dw"];
aliases.forEach(function (alias) {
    describe("." + alias, function () {
        it("writes the given 32-bit values to the buffer", function () {
            var buffer = new ArrayBuffer(8);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 0x12345678,0xFFFFFFFF\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(0x12345678);
            expect(dataView.getUint32(4)).to.equal(0xFFFFFFFF);
        });
        it("handles single word", function () {
            var buffer = new ArrayBuffer(4);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 0x1F2F3F00\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(0x1F2F3F00);
        });
        it("handles spaces", function () {
            var buffer = new ArrayBuffer(16);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 0x1234, 0x4567,     0x10, 128\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(0x1234);
            expect(dataView.getUint32(4)).to.equal(0x4567);
            expect(dataView.getUint32(8)).to.equal(0x10);
            expect(dataView.getUint32(12)).to.equal(128);
        });
        it("leaves only the lower 32 bits", function () {
            var buffer = new ArrayBuffer(8);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 0xFFFF12345678,0xFFFFFFA0010\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(0x12345678);
            expect(dataView.getUint32(4)).to.equal(0xFFFA0010);
        });
        it("preserves signed numbers", function () {
            var buffer = new ArrayBuffer(12);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " -256,-1,-90000\n      ", { buffer: buffer });
            expect(dataView.getInt32(0)).to.equal(-256);
            expect(dataView.getInt32(4)).to.equal(-1);
            expect(dataView.getInt32(8)).to.equal(-90000);
        });
        it("preserves unsigned numbers", function () {
            var buffer = new ArrayBuffer(12);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 65535,257,90000\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(65535);
            expect(dataView.getUint32(4)).to.equal(257);
            expect(dataView.getUint32(8)).to.equal(90000);
        });
        it("supports labels as values", function () {
            var buffer = new ArrayBuffer(12);
            var dataView = new DataView(buffer);
            assemble("\n        .org 0x80123456\n        .definelabel pos,0x1F2F3F00\n        .definelabel neg,-256\n        the_word!:\n        ." + alias + " pos,neg,the_word!\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(0x1F2F3F00);
            expect(dataView.getInt32(4)).to.equal(-256);
            expect(dataView.getUint32(8)).to.equal(0x80123456);
        });
        it("supports expressions as values", function () {
            var buffer = new ArrayBuffer(8);
            var dataView = new DataView(buffer);
            assemble("\n        .org 0x80123456\n        .definelabel pos,0x1F2F3F00\n        the_word!:\n        ." + alias + " hi(pos), lo(the_word!)\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(0x1F2F);
            expect(dataView.getUint32(4)).to.equal(0x3456);
        });
        it("supports labels as values, even if defined after the directive itself", function () {
            var buffer = new ArrayBuffer(12);
            var dataView = new DataView(buffer);
            assemble("\n        .org 0x80123456\n        the_word!:\n        ." + alias + " pos,neg,the_word!\n        .definelabel pos,0x1F2F3F00\n        .definelabel neg,-256\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(0x1F2F3F00);
            expect(dataView.getInt32(4)).to.equal(-256);
            expect(dataView.getUint32(8)).to.equal(0x80123456);
        });
        // TODO: What should happen with this case?
        xit("supports labels as values, even if redefined after the directive itself", function () {
            var buffer = new ArrayBuffer(12);
            var dataView = new DataView(buffer);
            assemble("\n        .org 0x80123456\n        .definelabel pos,1\n        .definelabel neg,-1\n        the_word!:\n        ." + alias + " pos,neg,the_word!\n        .definelabel pos,0x1F2F3F00\n        .definelabel neg,-256\n      ", { buffer: buffer });
            expect(dataView.getUint32(0)).to.equal(0x1F2F3F00);
            expect(dataView.getInt32(4)).to.equal(-256);
            expect(dataView.getUint32(8)).to.equal(0x80123456);
        });
    });
});
