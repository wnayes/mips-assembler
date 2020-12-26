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
});
