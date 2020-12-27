import "mocha";
import { expect } from "chai";
import { print } from "mips-inst";
import { assemble } from "../../src/assembler";
var aliases = ["byte", "db"];
aliases.forEach(function (alias) {
    describe("." + alias, function () {
        it("writes the given bytes to the buffer", function () {
            expect(print(assemble("\n        ADDU A0 A2 R0\n        JR RA\n        NOP\n        ." + alias + " 0,0x0,0x00,0xC\n        LUI A0 0x3F\n        LH A0 0(V0)\n      "))).to.deep.equal([
                "ADDU A0 A2 R0",
                "JR RA",
                "NOP",
                "SYSCALL",
                "LUI A0 0x3F",
                "LH A0 0(V0)",
            ]);
        });
        it("handles single bytes", function () {
            expect(print(assemble("\n        ADDU A0 A2 R0\n        JR RA\n        NOP\n        .fill 3\n        ." + alias + " 0xC\n        LUI A0 0x3F\n        LH A0 0(V0)\n      "))).to.deep.equal([
                "ADDU A0 A2 R0",
                "JR RA",
                "NOP",
                "SYSCALL",
                "LUI A0 0x3F",
                "LH A0 0(V0)",
            ]);
        });
        it("handles spaces", function () {
            expect(print(assemble("\n        ADDU A0 A2 R0\n        JR RA\n        NOP\n        ." + alias + " 0, 0x0,   0x00 , 0xC\n        LUI A0 0x3F\n        LH A0 0(V0)\n      "))).to.deep.equal([
                "ADDU A0 A2 R0",
                "JR RA",
                "NOP",
                "SYSCALL",
                "LUI A0 0x3F",
                "LH A0 0(V0)",
            ]);
        });
        it("leaves only the lower 8 bits", function () {
            expect(print(assemble("\n        ADDU A0 A2 R0\n        JR RA\n        NOP\n        ." + alias + " 0x33330000,0x2233330000,0,0x4330000C\n        LUI A0 0x3F\n        LH A0 0(V0)\n      "))).to.deep.equal([
                "ADDU A0 A2 R0",
                "JR RA",
                "NOP",
                "SYSCALL",
                "LUI A0 0x3F",
                "LH A0 0(V0)",
            ]);
        });
        it("preserves signed numbers", function () {
            var buffer = new ArrayBuffer(3);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " -1, -0xA, -127\n      ", { buffer: buffer });
            expect(dataView.getInt8(0)).to.equal(-1);
            expect(dataView.getInt8(1)).to.equal(-10);
            expect(dataView.getInt8(2)).to.equal(-127);
        });
        it("preserves unsigned numbers", function () {
            var buffer = new ArrayBuffer(3);
            var dataView = new DataView(buffer);
            assemble("\n        ." + alias + " 128, 255, 256\n      ", { buffer: buffer });
            expect(dataView.getUint8(0)).to.equal(128);
            expect(dataView.getUint8(1)).to.equal(255);
            expect(dataView.getUint8(2)).to.equal(0);
        });
    });
});
