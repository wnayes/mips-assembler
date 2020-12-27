import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
describe("bnezl", function () {
    it("creates a bnel branch", function () {
        expect(assemble("\n      ADDIU A0 R0 1\n      BNEZL A0 end\n      NOP\n      end:\n      JR RA\n    ", { text: true })).to.deep.equal([
            "ADDIU A0 R0 0x1",
            "BNEL A0 R0 0x1",
            "NOP",
            "JR RA",
        ]);
    });
});
