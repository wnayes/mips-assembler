import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

// TODO: setFloat32/getFloat32 causes some precision issues in comparisons.
xdescribe(".float", () => {
  it("writes the given 32-bit floats to the buffer", () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    assemble(`
      .float 123.456,0.99
    `, { buffer });

    expect(dataView.getFloat32(0)).to.equal(123.456);
    expect(dataView.getFloat32(4)).to.equal(0.99);
  });

  it("handles single float", () => {
    const buffer = new ArrayBuffer(4);
    const dataView = new DataView(buffer);
    assemble(`
      .float .234566
    `, { buffer });

    expect(dataView.getFloat32(0)).to.equal(0.234566);
  });

  it("handles spaces", () => {
    const buffer = new ArrayBuffer(16);
    const dataView = new DataView(buffer);
    assemble(`
      .float 12.555, .1,     .2, .0005
    `, { buffer });

    expect(dataView.getFloat32(0)).to.equal(12.555);
    expect(dataView.getFloat32(4)).to.equal(.1);
    expect(dataView.getFloat32(8)).to.equal(.2);
    expect(dataView.getFloat32(12)).to.equal(.0005);
  });

  it("preserves signed numbers", () => {
    const buffer = new ArrayBuffer(12);
    const dataView = new DataView(buffer);
    assemble(`
      .float -256.0,-1.01,-90000.333
    `, { buffer });

    expect(dataView.getFloat32(0)).to.equal(-256.0);
    expect(dataView.getFloat32(4)).to.equal(-1.01);
    expect(dataView.getFloat32(8)).to.equal(-90000.333);
  });
});
