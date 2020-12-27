import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
describe(".ascii", function () {
    it("writes a string with double quotes to the buffer", function () {
        var buffer = new ArrayBuffer(4);
        assemble("\n      .ascii \"test\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x74657374); // "test"
    });
    it("writes a string with single quotes to the buffer", function () {
        var buffer = new ArrayBuffer(8);
        assemble("\n      .ascii 'abcdefgh'\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
        expect(dataView.getUint32(4)).to.equal(0x65666768); // "efgh"
    });
    it("writes plain bytes to the buffer", function () {
        var buffer = new ArrayBuffer(4);
        assemble("\n      .ascii 10,0xB\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x0A0B0000);
    });
    it("handles strings with spaces", function () {
        var buffer = new ArrayBuffer(12);
        assemble("\n      .ascii \"Hello World\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x48656C6C);
        expect(dataView.getUint32(4)).to.equal(0x6F20576F);
        expect(dataView.getUint32(8)).to.equal(0x726C6400);
    });
    it("handles strings with tabs", function () {
        var buffer = new ArrayBuffer(12);
        assemble("\n      .ascii\t\"Hello\tWorld\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x48656C6C);
        expect(dataView.getUint32(4)).to.equal(0x6F09576F);
        expect(dataView.getUint32(8)).to.equal(0x726C6400);
    });
    it("handles strings with escaped tabs", function () {
        var buffer = new ArrayBuffer(12);
        assemble("\n      .ascii \"Hello\tWorld\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x48656C6C);
        expect(dataView.getUint32(4)).to.equal(0x6F09576F);
        expect(dataView.getUint32(8)).to.equal(0x726C6400);
    });
    it("handles basic escaped values", function () {
        var buffer = new ArrayBuffer(4);
        assemble("\n      .ascii \"\\n\\t\\r\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x0A090D00);
    });
    it("handles escaped backslash in middle", function () {
        var buffer = new ArrayBuffer(4);
        assemble("\n      .ascii \"a\\\\b\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x615C6200);
    });
    it("handles escaped backslash at end", function () {
        var buffer = new ArrayBuffer(4);
        assemble("\n      .ascii \"a\\\\\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x615C0000);
    });
    it("handles escaped octal values", function () {
        var buffer = new ArrayBuffer(4);
        assemble("\n      .ascii \"\\377\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0xFF000000);
    });
    it("can write multiple input values", function () {
        var buffer = new ArrayBuffer(20);
        assemble("\n      .ascii \"One string\",0xA,'two strin'\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x4F6E6520);
        expect(dataView.getUint32(4)).to.equal(0x73747269);
        expect(dataView.getUint32(8)).to.equal(0x6E670A74);
        expect(dataView.getUint32(12)).to.equal(0x776F2073);
        expect(dataView.getUint32(16)).to.equal(0x7472696E);
    });
    it("can handle commas inside strings", function () {
        var buffer = new ArrayBuffer(12);
        assemble("\n      .ascii \"One, two\",0xA,'3 4'\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x4F6E652C);
        expect(dataView.getUint32(4)).to.equal(0x2074776F);
        expect(dataView.getUint32(8)).to.equal(0x0A332034);
    });
    it("supports escaped quotes inside strings", function () {
        var buffer = new ArrayBuffer(16);
        assemble("\n      .ascii \"\\\"One\\\", \\\"two\\\"\",0xA,'3 4'\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x224F6E65);
        expect(dataView.getUint32(4)).to.equal(0x222C2022);
        expect(dataView.getUint32(8)).to.equal(0x74776F22);
        expect(dataView.getUint32(12)).to.equal(0x0A332034);
    });
    it("handles mixing quote characters", function () {
        var buffer = new ArrayBuffer(4);
        assemble("\n      .ascii \"'\",'\"'\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x27220000);
    });
    it("handles multiple mixed quote characters", function () {
        var buffer = new ArrayBuffer(16);
        assemble("\n      .ascii \"It's dog's toy\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x49742773);
        expect(dataView.getUint32(4)).to.equal(0x20646F67);
        expect(dataView.getUint32(8)).to.equal(0x27732074);
        expect(dataView.getUint32(12)).to.equal(0x6F790000);
    });
    it("handles parenthesis in quotes", function () {
        var buffer = new ArrayBuffer(8);
        assemble("\n      .ascii \":) :(\"\n    ", { buffer: buffer });
        var dataView = new DataView(buffer);
        expect(dataView.getUint32(0)).to.equal(0x3A29203A);
        expect(dataView.getUint32(4)).to.equal(0x28000000);
    });
    it("preserves signed numbers", function () {
        var buffer = new ArrayBuffer(3);
        var dataView = new DataView(buffer);
        assemble("\n      .ascii -1, -0xA, -127\n    ", { buffer: buffer });
        expect(dataView.getInt8(0)).to.equal(-1);
        expect(dataView.getInt8(1)).to.equal(-10);
        expect(dataView.getInt8(2)).to.equal(-127);
    });
    it("preserves unsigned numbers", function () {
        var buffer = new ArrayBuffer(3);
        var dataView = new DataView(buffer);
        assemble("\n      .ascii 128, 255, 256\n    ", { buffer: buffer });
        expect(dataView.getUint8(0)).to.equal(128);
        expect(dataView.getUint8(1)).to.equal(255);
        expect(dataView.getUint8(2)).to.equal(0);
    });
});
describe(".asciiz", function () {
    it("appends a zero after the test string", function () {
        var buffer = new ArrayBuffer(5);
        var dataView = new DataView(buffer);
        dataView.setUint8(4, 0xFF); // To ensure it writes the 0
        assemble("\n      .asciiz \"test\"\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x74657374); // "test"
        expect(dataView.getUint8(4)).to.equal(0); // NULL
    });
    it("only appends the zero after all values", function () {
        var buffer = new ArrayBuffer(21);
        var dataView = new DataView(buffer);
        dataView.setUint8(20, 0xFF);
        assemble("\n      .asciiz \"One string\",0xA,'two strin'\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x4F6E6520);
        expect(dataView.getUint32(4)).to.equal(0x73747269);
        expect(dataView.getUint32(8)).to.equal(0x6E670A74);
        expect(dataView.getUint32(12)).to.equal(0x776F2073);
        expect(dataView.getUint32(16)).to.equal(0x7472696E);
        expect(dataView.getUint8(20)).to.equal(0);
    });
});
