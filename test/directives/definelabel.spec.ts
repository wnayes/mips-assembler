import "mocha";
import { expect } from "chai";

import { assemble } from "../../src/assembler";

describe(".definelabel", () => {
  it("defines an address label", () => {
    expect(assemble(`
      .definelabel ExternalLibFn,0x80023456
      JAL ExternalLibFn
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "NOP",
    ]);
  });

  it("can be used to define numeric constants", () => {
    expect(assemble(`
      .definelabel const1,1000
      JAL 0x80023456
      ADDIU A0 R0 const1
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "ADDIU A0 R0 0x3E8",
      "NOP",
    ]);
  });

  it("can be used to define negative numeric constants", () => {
    expect(assemble(`
      .definelabel const1,-1000
      JAL 0x80023456
      ADDIU A0 R0 const1
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "ADDIU A0 R0 -0x3E8",
      "NOP",
    ]);
  });

  it("handles the zero constant", () => {
    expect(assemble(`
      .definelabel const1,0
      JAL 0x80023456
      ADDIU A0 R0 const1
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "ADDIU A0 R0 0",
      "NOP",
    ]);
  });
});
