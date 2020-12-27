import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
describe(".endif", function () {
    it("complains about unbalanced endif", function () {
        expect(function () { return print(assemble("\n      .if 1\n      LH A0 0(V0)\n      ADDIU V0 R0 10\n      .endif\n      .endif\n    ")); }).to.throw();
    });
});
