import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".ascii", () => {
  it("writes a string with double quotes to the buffer", () => {
    const buffer = new ArrayBuffer(4);
    assemble(`
      .ascii "test"
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x74657374); // "test"
  });

  it("writes a string with single quotes to the buffer", () => {
    const buffer = new ArrayBuffer(8);
    assemble(`
      .ascii 'abcdefgh'
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x61626364); // "abcd"
    expect(dataView.getUint32(4)).to.equal(0x65666768); // "efgh"
  });

  it("writes plain bytes to the buffer", () => {
    const buffer = new ArrayBuffer(4);
    assemble(`
      .ascii 10,0xB
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x0A0B0000);
  });

  it("handles strings with spaces", () => {
    const buffer = new ArrayBuffer(12);
    assemble(`
      .ascii "Hello World"
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x48656C6C);
    expect(dataView.getUint32(4)).to.equal(0x6F20576F);
    expect(dataView.getUint32(8)).to.equal(0x726C6400);
  });

  it("handles strings with tabs", () => {
    const buffer = new ArrayBuffer(12);
    assemble(`
      .ascii	"Hello	World"
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x48656C6C);
    expect(dataView.getUint32(4)).to.equal(0x6F09576F);
    expect(dataView.getUint32(8)).to.equal(0x726C6400);
  });

  it("can write multiple input values", () => {
    const buffer = new ArrayBuffer(20);
    assemble(`
      .ascii "One string",0xA,'two strin'
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x4F6E6520);
    expect(dataView.getUint32(4)).to.equal(0x73747269);
    expect(dataView.getUint32(8)).to.equal(0x6E670A74);
    expect(dataView.getUint32(12)).to.equal(0x776F2073);
    expect(dataView.getUint32(16)).to.equal(0x7472696E);
  });

  it("can handle commas inside strings", () => {
    const buffer = new ArrayBuffer(12);
    assemble(`
      .ascii "One, two",0xA,'3 4'
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x4F6E652C);
    expect(dataView.getUint32(4)).to.equal(0x2074776F);
    expect(dataView.getUint32(8)).to.equal(0x0A332034);
  });

  it("supports escaped quotes inside strings", () => {
    const buffer = new ArrayBuffer(16);
    assemble(`
      .ascii "\\"One\\", \\"two\\"",0xA,'3 4'
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x224F6E65);
    expect(dataView.getUint32(4)).to.equal(0x222C2022);
    expect(dataView.getUint32(8)).to.equal(0x74776F22);
    expect(dataView.getUint32(12)).to.equal(0x0A332034);
  });

  it("handles mixing quote characters", () => {
    const buffer = new ArrayBuffer(4);
    assemble(`
      .ascii "'",'"'
    `, { buffer });

    const dataView = new DataView(buffer);
    expect(dataView.getUint32(0)).to.equal(0x27220000);
  });

  it("preserves signed numbers", () => {
    const buffer = new ArrayBuffer(3);
    const dataView = new DataView(buffer);
    assemble(`
      .ascii -1, -0xA, -127
    `, { buffer });

    expect(dataView.getInt8(0)).to.equal(-1);
    expect(dataView.getInt8(1)).to.equal(-10);
    expect(dataView.getInt8(2)).to.equal(-127);
  });

  it("preserves unsigned numbers", () => {
    const buffer = new ArrayBuffer(3);
    const dataView = new DataView(buffer);
    assemble(`
      .ascii 128, 255, 256
    `, { buffer });

    expect(dataView.getUint8(0)).to.equal(128);
    expect(dataView.getUint8(1)).to.equal(255);
    expect(dataView.getUint8(2)).to.equal(0);
  });
});

describe(".asciiz", () => {
  it("appends a zero after the test string", () => {
    const buffer = new ArrayBuffer(5);
    const dataView = new DataView(buffer);
    dataView.setUint8(4, 0xFF); // To ensure it writes the 0
    assemble(`
      .asciiz "test"
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x74657374); // "test"
    expect(dataView.getUint8(4)).to.equal(0); // NULL
  });

  it("only appends the zero after all values", () => {
    const buffer = new ArrayBuffer(21);
    const dataView = new DataView(buffer);
    dataView.setUint8(20, 0xFF);
    assemble(`
      .asciiz "One string",0xA,'two strin'
    `, { buffer });

    expect(dataView.getUint32(0)).to.equal(0x4F6E6520);
    expect(dataView.getUint32(4)).to.equal(0x73747269);
    expect(dataView.getUint32(8)).to.equal(0x6E670A74);
    expect(dataView.getUint32(12)).to.equal(0x776F2073);
    expect(dataView.getUint32(16)).to.equal(0x7472696E);
    expect(dataView.getUint8(20)).to.equal(0);
  });
});
