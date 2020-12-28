import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
describe("equ", function () {
    it("can define a global replacement", function () {
        var buffer = new ArrayBuffer(4);
        var dataView = new DataView(buffer);
        assemble("\n      GlobalEqu equ 1\n      .word GlobalEqu\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x00000001);
    });
    it("can define a static label replacement", function () {
        var buffer = new ArrayBuffer(4);
        var dataView = new DataView(buffer);
        assemble("\n      @StaticEqu equ 1\n      .word @StaticEqu\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x00000001);
    });
    it("can define a local label replacement", function () {
        var buffer = new ArrayBuffer(8);
        var dataView = new DataView(buffer);
        assemble("\n      GlobalLabel:\n      @@LocalEqu equ 1\n      .word @@LocalEqu\n      GlobalLabel2:\n      @@LocalEqu equ 2\n      .word @@LocalEqu\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x00000001);
        expect(dataView.getUint32(4)).to.equal(0x00000002);
    });
    it("can define a comma-separated list of values", function () {
        var buffer = new ArrayBuffer(4);
        var dataView = new DataView(buffer);
        assemble("\n      ListAlias equ 1,2,3,4\n      .byte ListAlias\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x01020304);
    });
    it("can define a comma-separated list of values", function () {
        var buffer = new ArrayBuffer(4);
        var dataView = new DataView(buffer);
        assemble("\n      ListAlias equ 1,2,3,4\n      .byte ListAlias\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x01020304);
    });
    it("properly handles one replacement label that is a subset of another", function () {
        var buffer = new ArrayBuffer(8);
        var dataView = new DataView(buffer);
        assemble("\n      List equ 1,2,3,4\n      ListAlias equ 5,6,7,8\n      .byte List\n      .byte ListAlias\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x01020304);
        expect(dataView.getUint32(4)).to.equal(0x05060708);
    });
    it("can be used within instructions", function () {
        var buffer = new ArrayBuffer(12);
        var dataView = new DataView(buffer);
        assemble("\n      StringPointer equ 0x20(SP)\n\n      lw  a0,StringPointer\n      nop\n      sw  a1,StringPointer\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x8FA40020);
        expect(dataView.getUint32(4)).to.equal(0x00000000);
        expect(dataView.getUint32(8)).to.equal(0xAFA50020);
    });
    it("will recursively process, assuming no infinite recursion", function () {
        var buffer = new ArrayBuffer(8);
        var dataView = new DataView(buffer);
        assemble("\n      ListA equ 1,2,3,4\n      ListB equ 5,6,7,8\n      List equ ListA,ListB\n      .byte List\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x01020304);
        expect(dataView.getUint32(4)).to.equal(0x05060708);
    });
    it("can handle spaces in equivalence value", function () {
        var buffer = new ArrayBuffer(8);
        var dataView = new DataView(buffer);
        assemble("\n      ListA equ 1, 2, 3, 4\n      ListB equ 5 6 7 8\n      List equ ListA ListB\n      .byte List\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x01020304);
        expect(dataView.getUint32(4)).to.equal(0x05060708);
    });
    it("can handle quoted string values as equivalence value", function () {
        var buffer = new ArrayBuffer(8);
        var dataView = new DataView(buffer);
        assemble("\n      text equ \"abcdefgh\"\n      .ascii text\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
        expect(dataView.getUint32(4)).to.equal(0x65666768); // "efgh"
    });
    it("can handle quoted string values as equivalence value (2)", function () {
        var buffer = new ArrayBuffer(8);
        var dataView = new DataView(buffer);
        assemble("\n      first equ \"abcd\"\n      second equ 'efgh'\n      .ascii first,second\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
        expect(dataView.getUint32(4)).to.equal(0x65666768); // "efgh"
    });
    it("can handle empty value", function () {
        var buffer = new ArrayBuffer(8);
        var dataView = new DataView(buffer);
        assemble("\n      nothing equ\n      .ascii \"abcd\" \"efgh\" nothing\n    ", { buffer: buffer });
        expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
        expect(dataView.getUint32(4)).to.equal(0x65666768); // "efgh"
    });
});
