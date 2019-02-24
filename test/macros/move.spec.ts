import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe("move", () => {
  it("swaps for an addu instruction", () => {
    expect(assemble(`
      MOVE A0 V0
      MOVE SP SP
    `, { text: true })).to.deep.equal([
      "ADDU A0 R0 V0",
      "ADDU SP R0 SP",
    ]);
  });
});
