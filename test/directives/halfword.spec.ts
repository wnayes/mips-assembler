import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

const aliases = ["halfword", "dh"];

aliases.forEach(alias => {
  describe(`.${alias}`, () => {
    it("writes the given 16-bit values to the buffer", () => {
      const buffer = new ArrayBuffer(4);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 0x1234,22136
      `, { buffer });

      expect(dataView.getUint16(0)).to.equal(0x1234);
      expect(dataView.getUint16(2)).to.equal(0x5678);
    });

    it("handles single halfword", () => {
      const buffer = new ArrayBuffer(2);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 0x1234
      `, { buffer });

      expect(dataView.getUint16(0)).to.equal(0x1234);
    });

    it("handles spaces", () => {
      const buffer = new ArrayBuffer(8);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 0x1234, 0x4567,     0x10, 128
      `, { buffer });

      expect(dataView.getUint16(0)).to.equal(0x1234);
      expect(dataView.getUint16(2)).to.equal(0x4567);
      expect(dataView.getUint16(4)).to.equal(0x10);
      expect(dataView.getUint16(6)).to.equal(128);
    });

    it("leaves only the lower 16 bits", () => {
      const buffer = new ArrayBuffer(4);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 0x12345678,0xA0010
      `, { buffer });

      expect(dataView.getUint16(0)).to.equal(0x5678);
      expect(dataView.getUint16(2)).to.equal(0x10);
    });

    it("preserves signed numbers", () => {
      const buffer = new ArrayBuffer(6);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} -256,-1,-90000
      `, { buffer });

      expect(dataView.getInt16(0)).to.equal(-256);
      expect(dataView.getInt16(2)).to.equal(-1);
      expect(dataView.getInt16(4)).to.equal(-24464);
    });

    it("preserves unsigned numbers", () => {
      const buffer = new ArrayBuffer(6);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 65535,257,90000
      `, { buffer });

      expect(dataView.getUint16(0)).to.equal(65535);
      expect(dataView.getUint16(2)).to.equal(257);
      expect(dataView.getUint16(4)).to.equal(24464);
    });

    it("supports labels as values", () => {
      const buffer = new ArrayBuffer(6);
      const dataView = new DataView(buffer);
      assemble(`
        .org 0x80123456
        .definelabel pos,0x1234
        .definelabel neg,-256
        the_word!:
        .${alias} pos,neg,the_word!
      `, { buffer });

      expect(dataView.getUint16(0)).to.equal(0x1234);
      expect(dataView.getInt16(2)).to.equal(-256);
      expect(dataView.getUint16(4)).to.equal(0x3456);
    });

    it("supports expressions as values", () => {
      const buffer = new ArrayBuffer(4);
      const dataView = new DataView(buffer);
      assemble(`
        .org 0x80123456
        .definelabel pos,0x1F2F3F00
        the_word!:
        .${alias} lo(pos), hi(the_word!)
      `, { buffer });

      expect(dataView.getUint16(0)).to.equal(0x3F00);
      expect(dataView.getUint16(2)).to.equal(0x8012);
    });
  });
});
