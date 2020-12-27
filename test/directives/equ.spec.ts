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
});
