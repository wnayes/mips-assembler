import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".orga", function () {
    it("adjusts the output position in the given buffer", function () {
        var buffer = new ArrayBuffer(32);
        expect(print(assemble("\n      ADDU A0 A2 R0\n      JR RA\n      NOP\n      .orga 24\n      LUI A0 0x3F\n      LH A0 0(V0)\n    ", { buffer: buffer }))).to.deep.equal([
            "ADDU A0 A2 R0",
            "JR RA",
            "NOP",
            "NOP",
            "NOP",
            "NOP",
            "LUI A0 0x3F",
            "LH A0 0(V0)",
        ]);
    });
});
