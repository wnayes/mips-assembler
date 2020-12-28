import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe("equ", () => {
  it("can define a global replacement", () => {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer);
    assemble(`
      GlobalEqu equ 1
      .word GlobalEqu
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x00000001);
  });

  it("can define a static label replacement", () => {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer);
    assemble(`
      @StaticEqu equ 1
      .word @StaticEqu
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x00000001);
  });

  it("can define a local label replacement", () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    assemble(`
      GlobalLabel:
      @@LocalEqu equ 1
      .word @@LocalEqu
      GlobalLabel2:
      @@LocalEqu equ 2
      .word @@LocalEqu
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x00000001);
    expect(dataView.getUint32(4)).to.equal(0x00000002);
  });

  it("can define a comma-separated list of values", () => {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer);
    assemble(`
      ListAlias equ 1,2,3,4
      .byte ListAlias
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x01020304);
  });

  it("can define a comma-separated list of values", () => {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer);
    assemble(`
      ListAlias equ 1,2,3,4
      .byte ListAlias
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x01020304);
  });

  it("properly handles one replacement label that is a subset of another", () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    assemble(`
      List equ 1,2,3,4
      ListAlias equ 5,6,7,8
      .byte List
      .byte ListAlias
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x01020304);
    expect(dataView.getUint32(4)).to.equal(0x05060708);
  });

  it("can be used within instructions", () => {
    const buffer = new ArrayBuffer(12);
    const dataView = new DataView(buffer);
    assemble(`
      StringPointer equ 0x20(SP)

      lw  a0,StringPointer
      nop
      sw  a1,StringPointer
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x8FA40020);
    expect(dataView.getUint32(4)).to.equal(0x00000000);
    expect(dataView.getUint32(8)).to.equal(0xAFA50020);
  });

  it("will recursively process, assuming no infinite recursion", () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    assemble(`
      ListA equ 1,2,3,4
      ListB equ 5,6,7,8
      List equ ListA,ListB
      .byte List
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x01020304);
    expect(dataView.getUint32(4)).to.equal(0x05060708);
  });

  it("can handle spaces in equivalence value", () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    assemble(`
      ListA equ 1, 2, 3, 4
      ListB equ 5 6 7 8
      List equ ListA ListB
      .byte List
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x01020304);
    expect(dataView.getUint32(4)).to.equal(0x05060708);
  });

  it("can handle quoted string values as equivalence value", () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    assemble(`
      text equ "abcdefgh"
      .ascii text
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
    expect(dataView.getUint32(4)).to.equal(0x65666768); // "efgh"
  });

  it("can handle quoted string values as equivalence value (2)", () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    assemble(`
      first equ "abcd"
      second equ 'efgh'
      .ascii first,second
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
    expect(dataView.getUint32(4)).to.equal(0x65666768); // "efgh"
  });

  it("can handle empty value", () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    assemble(`
      nothing equ
      .ascii "abcd" "efgh" nothing
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
    expect(dataView.getUint32(4)).to.equal(0x65666768); // "efgh"
  });
});
