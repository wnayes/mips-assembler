import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

const aliases = ["word", "dw"];

aliases.forEach(alias => {
  describe(`.${alias}`, () => {
    it("writes the given 32-bit values to the buffer", () => {
      const buffer = new ArrayBuffer(8);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 0x12345678,0xFFFFFFFF
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(0x12345678);
      expect(dataView.getUint32(4)).to.equal(0xFFFFFFFF);
    });

    it("handles single word", () => {
      const buffer = new ArrayBuffer(4);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 0x1F2F3F00
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(0x1F2F3F00);
    });

    it("handles spaces", () => {
      const buffer = new ArrayBuffer(16);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 0x1234, 0x4567,     0x10, 128
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(0x1234);
      expect(dataView.getUint32(4)).to.equal(0x4567);
      expect(dataView.getUint32(8)).to.equal(0x10);
      expect(dataView.getUint32(12)).to.equal(128);
    });

    it("leaves only the lower 32 bits", () => {
      const buffer = new ArrayBuffer(8);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 0xFFFF12345678,0xFFFFFFA0010
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(0x12345678);
      expect(dataView.getUint32(4)).to.equal(0xFFFA0010);
    });

    it("preserves signed numbers", () => {
      const buffer = new ArrayBuffer(12);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} -256,-1,-90000
      `, { buffer });

      expect(dataView.getInt32(0)).to.equal(-256);
      expect(dataView.getInt32(4)).to.equal(-1);
      expect(dataView.getInt32(8)).to.equal(-90000);
    });

    it("preserves unsigned numbers", () => {
      const buffer = new ArrayBuffer(12);
      const dataView = new DataView(buffer);
      assemble(`
        .${alias} 65535,257,90000
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(65535);
      expect(dataView.getUint32(4)).to.equal(257);
      expect(dataView.getUint32(8)).to.equal(90000);
    });

    it("supports labels as values", () => {
      const buffer = new ArrayBuffer(12);
      const dataView = new DataView(buffer);
      assemble(`
        .org 0x80123456
        .definelabel pos,0x1F2F3F00
        .definelabel neg,-256
        the_word!:
        .${alias} pos,neg,the_word!
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(0x1F2F3F00);
      expect(dataView.getInt32(4)).to.equal(-256);
      expect(dataView.getUint32(8)).to.equal(0x80123456);
    });

    it("supports expressions as values", () => {
      const buffer = new ArrayBuffer(8);
      const dataView = new DataView(buffer);
      assemble(`
        .org 0x80123456
        .definelabel pos,0x1F2F3F00
        the_word!:
        .${alias} hi(pos), lo(the_word!)
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(0x1F2F);
      expect(dataView.getUint32(4)).to.equal(0x3456);
    });

    it("supports labels as values, even if defined after the directive itself", () => {
      const buffer = new ArrayBuffer(12);
      const dataView = new DataView(buffer);
      assemble(`
        .org 0x80123456
        the_word!:
        .${alias} pos,neg,the_word!
        .definelabel pos,0x1F2F3F00
        .definelabel neg,-256
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(0x1F2F3F00);
      expect(dataView.getInt32(4)).to.equal(-256);
      expect(dataView.getUint32(8)).to.equal(0x80123456);
    });

    // TODO: What should happen with this case?
    xit("supports labels as values, even if redefined after the directive itself", () => {
      const buffer = new ArrayBuffer(12);
      const dataView = new DataView(buffer);
      assemble(`
        .org 0x80123456
        .definelabel pos,1
        .definelabel neg,-1
        the_word!:
        .${alias} pos,neg,the_word!
        .definelabel pos,0x1F2F3F00
        .definelabel neg,-256
      `, { buffer });

      expect(dataView.getUint32(0)).to.equal(0x1F2F3F00);
      expect(dataView.getInt32(4)).to.equal(-256);
      expect(dataView.getUint32(8)).to.equal(0x80123456);
    });
  });
});
