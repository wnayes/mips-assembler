import "mocha";
import { expect } from "chai";

import { print } from "mips-inst";

import { assemble } from "../../src/assembler";

const aliases = ["byte", "db"];

aliases.forEach(alias => {
  describe(`.${alias}`, () => {
    it("writes the given bytes to the buffer", () => {
      expect(print(assemble(`
        ADDU A0 A2 R0
        JR RA
        NOP
        .${alias} 0,0x0,0x00,0xC
        LUI A0 0x3F
        LH A0 0(V0)
      `))).to.deep.equal([
        "ADDU A0 A2 R0",
        "JR RA",
        "NOP",
        "SYSCALL",
        "LUI A0 0x3F",
        "LH A0 0(V0)",
      ]);
    });

    it("handles single bytes", () => {
      expect(print(assemble(`
        ADDU A0 A2 R0
        JR RA
        NOP
        .fill 3
        .${alias} 0xC
        LUI A0 0x3F
        LH A0 0(V0)
      `))).to.deep.equal([
        "ADDU A0 A2 R0",
        "JR RA",
        "NOP",
        "SYSCALL",
        "LUI A0 0x3F",
        "LH A0 0(V0)",
      ]);
    });

    it("handles spaces", () => {
      expect(print(assemble(`
        ADDU A0 A2 R0
        JR RA
        NOP
        .${alias} 0, 0x0,   0x00 , 0xC
        LUI A0 0x3F
        LH A0 0(V0)
      `))).to.deep.equal([
        "ADDU A0 A2 R0",
        "JR RA",
        "NOP",
        "SYSCALL",
        "LUI A0 0x3F",
        "LH A0 0(V0)",
      ]);
    });

    it("leaves only the lower 8 bits", () => {
      expect(print(assemble(`
        ADDU A0 A2 R0
        JR RA
        NOP
        .${alias} 0x33330000,0x2233330000,0,0x4330000C
        LUI A0 0x3F
        LH A0 0(V0)
      `))).to.deep.equal([
        "ADDU A0 A2 R0",
        "JR RA",
        "NOP",
        "SYSCALL",
        "LUI A0 0x3F",
        "LH A0 0(V0)",
      ]);
    });
  });
});
