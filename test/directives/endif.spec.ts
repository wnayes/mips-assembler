import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".endif", () => {
  it("complains about unbalanced endif", () => {
    expect(() => print(assemble(`
      .if 1
      LH A0 0(V0)
      ADDIU V0 R0 10
      .endif
      .endif
    `))).to.throw();
  });
});
