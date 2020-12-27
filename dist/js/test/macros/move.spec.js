import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
describe("move", function () {
    it("swaps for an addu instruction", function () {
        expect(assemble("\n      MOVE A0 V0\n      MOVE SP SP\n    ", { text: true })).to.deep.equal([
            "ADDU A0 V0 R0",
            "ADDU SP SP R0",
        ]);
    });
});
