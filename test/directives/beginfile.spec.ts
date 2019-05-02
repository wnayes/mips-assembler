import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

describe(".beginfile", () => {
  it("doesn't do anything special when no additional features are used", () => {
    expect(print(assemble(`
      LB S0 24(SP)
      LW S1 0(S0)
      .beginfile
      ORI S2 R0 0
      ORI S3 R0 0
      ORI S4 R0 0
      ORI S5 R0 0
      .endfile
      LW S6 0(S0)
      BGEZ S5 done
      LW S7 0(S6)
      ADDU S2 S2 S7
      BLEZ S7 neg
      ADDU S3 S3 S7
      J update
    neg:
      BGEZ S7 update
      ADDU S4 S4 S7
    update:
      ADDI S5 S5 1
      ADDI S6 S6 4
    done:
      JR RA
    `))).to.deep.equal([
      "LB S0 0x18(SP)",
      "LW S1 0(S0)",
      "ORI S2 R0 0",
      "ORI S3 R0 0",
      "ORI S4 R0 0",
      "ORI S5 R0 0",
      "LW S6 0(S0)",
      "BGEZ S5 0x9",
      "LW S7 0(S6)",
      "ADDU S2 S2 S7",
      "BLEZ S7 0x2",
      "ADDU S3 S3 S7",
      "J 0x3C",
      "BGEZ S7 0x1",
      "ADDU S4 S4 S7",
      "ADDI S5 S5 0x1",
      "ADDI S6 S6 0x4",
      "JR RA",
    ]);
  });

  it("can be nested", () => {
    expect(print(assemble(`
      LB S0 24(SP)
      LW S1 0(S0)
      .beginfile
      ORI S2 R0 0
      .beginfile
      ORI S3 R0 0
      ORI S4 R0 0
      .endfile
      ORI S5 R0 0
      .endfile
      LW S6 0(S0)
      BGEZ S5 done
      LW S7 0(S6)
      ADDU S2 S2 S7
      BLEZ S7 neg
      ADDU S3 S3 S7
      J update
    neg:
      BGEZ S7 update
      ADDU S4 S4 S7
    update:
      ADDI S5 S5 1
      ADDI S6 S6 4
    done:
      JR RA
    `))).to.deep.equal([
      "LB S0 0x18(SP)",
      "LW S1 0(S0)",
      "ORI S2 R0 0",
      "ORI S3 R0 0",
      "ORI S4 R0 0",
      "ORI S5 R0 0",
      "LW S6 0(S0)",
      "BGEZ S5 0x9",
      "LW S7 0(S6)",
      "ADDU S2 S2 S7",
      "BLEZ S7 0x2",
      "ADDU S3 S3 S7",
      "J 0x3C",
      "BGEZ S7 0x1",
      "ADDU S4 S4 S7",
      "ADDI S5 S5 0x1",
      "ADDI S6 S6 0x4",
      "JR RA",
    ]);
  });

  it("can be used adjacent to one another", () => {
    expect(print(assemble(`
      LB S0 24(SP)
      LW S1 0(S0)
      .beginfile
      ORI S2 R0 0
      .endfile
      ORI S3 R0 0
      ORI S4 R0 0
      .beginfile
      ORI S5 R0 0
      .endfile
      LW S6 0(S0)
      BGEZ S5 done
      LW S7 0(S6)
      ADDU S2 S2 S7
      BLEZ S7 neg
      ADDU S3 S3 S7
      J update
    neg:
      BGEZ S7 update
      ADDU S4 S4 S7
    update:
      ADDI S5 S5 1
      ADDI S6 S6 4
    done:
      JR RA
    `))).to.deep.equal([
      "LB S0 0x18(SP)",
      "LW S1 0(S0)",
      "ORI S2 R0 0",
      "ORI S3 R0 0",
      "ORI S4 R0 0",
      "ORI S5 R0 0",
      "LW S6 0(S0)",
      "BGEZ S5 0x9",
      "LW S7 0(S6)",
      "ADDU S2 S2 S7",
      "BLEZ S7 0x2",
      "ADDU S3 S3 S7",
      "J 0x3C",
      "BGEZ S7 0x1",
      "ADDU S4 S4 S7",
      "ADDI S5 S5 0x1",
      "ADDI S6 S6 0x4",
      "JR RA",
    ]);
  });

  it("throws if a file is started without ending", () => {
    expect(() => assemble(`
      LB S0 24(SP)
      LW S1 0(S0)
      .beginfile
      ORI S2 R0 0
      .beginfile
      ORI S3 R0 0
      ORI S4 R0 0
      .beginfile
      ORI S5 R0 0
      LW S6 0(S0)
    `)).to.throw();
  });

  it("scopes labels correctly", () => {
    expect(assemble(`
      .definelabel @static,1
      .beginfile
      .definelabel @static,0
      .if @static
      JAL 0x80023456
      .endif
      .endfile
      .if @static
      JAL 0x80012345
      .endif
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80012345",
      "NOP",
    ]);
  });

  it("deeply nested label scoping", () => {
    expect(assemble(`
      .definelabel @static,1
      .beginfile
      .definelabel @static,0
      .beginfile
      .definelabel @static,1
      .if @static
      JAL 0x80023456
      .endif
      .endfile
      .endfile
      .if @static
      JAL 0x80012345
      .endif
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "JAL 0x80012345",
      "NOP",
    ]);
  });
});
