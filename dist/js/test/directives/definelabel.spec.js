import "mocha";
import { expect } from "chai";
import { assemble } from "../../src/assembler";
describe(".definelabel", function () {
    it("defines an address label", function () {
        expect(assemble("\n      .definelabel ExternalLibFn,0x80023456\n      JAL ExternalLibFn\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "NOP",
        ]);
    });
    it("can be used to define numeric constants", function () {
        expect(assemble("\n      .definelabel const1,1000\n      JAL 0x80023456\n      ADDIU A0 R0 const1\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "ADDIU A0 R0 0x3E8",
            "NOP",
        ]);
    });
    it("can be used to define negative numeric constants", function () {
        expect(assemble("\n      .definelabel const1,-1000\n      JAL 0x80023456\n      ADDIU A0 R0 const1\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "ADDIU A0 R0 -0x3E8",
            "NOP",
        ]);
    });
    it("handles the zero constant", function () {
        expect(assemble("\n      .definelabel const1,0\n      JAL 0x80023456\n      ADDIU A0 R0 const1\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "ADDIU A0 R0 0",
            "NOP",
        ]);
    });
    it("handles underscores", function () {
        expect(assemble("\n      .definelabel const_1,0\n      JAL 0x80023456\n      ADDIU A0 R0 const_1\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "ADDIU A0 R0 0",
            "NOP",
        ]);
    });
    it("handles '?'", function () {
        expect(assemble("\n      .definelabel const1?,0\n      JAL 0x80023456\n      ADDIU A0 R0 const1?\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "ADDIU A0 R0 0",
            "NOP",
        ]);
    });
    it("handles '!'", function () {
        expect(assemble("\n      .definelabel const!,0\n      JAL 0x80023456\n      ADDIU A0 R0 const!\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "ADDIU A0 R0 0",
            "NOP",
        ]);
    });
    it("can define label aliases", function () {
        expect(assemble("\n      .definelabel ExternalLibFn,0x80023456\n      .definelabel ExternalLibFnAlt,ExternalLibFn\n      JAL ExternalLibFnAlt\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "NOP",
        ]);
    });
    it("can define label aliases with '!', '?'", function () {
        expect(assemble("\n      .definelabel External_Lib_Fn?!,0x80023456\n      .definelabel ExternalLibFnAlt?,External_Lib_Fn?!\n      JAL ExternalLibFnAlt?\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "NOP",
        ]);
    });
    it("can define static labels", function () {
        expect(assemble("\n      .definelabel @static,0x80023456\n      JAL @static\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "NOP",
        ]);
    });
    it("can define local labels", function () {
        expect(assemble("\n      global:\n      .definelabel @@local,0x80023456\n      JAL @@local\n      NOP\n    ", { text: true })).to.deep.equal([
            "JAL 0x80023456",
            "NOP",
        ]);
    });
});
