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

  it("handles underscores", () => {
    expect(assemble(`
      .definelabel const_1,0
      JAL 0x80023456
      ADDIU A0 R0 const_1
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "ADDIU A0 R0 0",
      "NOP",
    ]);
  });

  it("handles '?'", () => {
    expect(assemble(`
      .definelabel const1?,0
      JAL 0x80023456
      ADDIU A0 R0 const1?
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "ADDIU A0 R0 0",
      "NOP",
    ]);
  });

  it("handles '!'", () => {
    expect(assemble(`
      .definelabel const!,0
      JAL 0x80023456
      ADDIU A0 R0 const!
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "ADDIU A0 R0 0",
      "NOP",
    ]);
  });

  it("can define label aliases", () => {
    expect(assemble(`
      .definelabel ExternalLibFn,0x80023456
      .definelabel ExternalLibFnAlt,ExternalLibFn
      JAL ExternalLibFnAlt
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "NOP",
    ]);
  });

  it("can define label aliases with '!', '?'", () => {
    expect(assemble(`
      .definelabel External_Lib_Fn?!,0x80023456
      .definelabel ExternalLibFnAlt?,External_Lib_Fn?!
      JAL ExternalLibFnAlt?
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "NOP",
    ]);
  });

  it("can define static labels", () => {
    expect(assemble(`
      .definelabel @static,0x80023456
      JAL @static
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "NOP",
    ]);
  });

  it("can define local labels", () => {
    expect(assemble(`
      global:
      .definelabel @@local,0x80023456
      JAL @@local
      NOP
    `, { text: true })).to.deep.equal([
      "JAL 0x80023456",
      "NOP",
    ]);
  });
});
