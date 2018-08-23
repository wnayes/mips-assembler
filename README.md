mips-assembler
==============

Simple MIPS IV assembler for JavaScript.

The features that are included were made compatible with [armips](https://github.com/Kingcom/armips), though `armips` is much more sophisticated.

Usage
-----

```javascript
import { assemble } from "mips-assembler";

assemble(`
  .org 0x80050000

  .definelabel ExternalPtr,0x8033C000
  .definelabel ExternalLibFn,0x80104321

  ADDIU SP SP 0xFFE0
  SW RA 0x18(SP)

  loop:
  LUI A0 hi(ExternalPtr)
  JAL ExternalLibFn
  ADDIU A0 A0 lo(ExternalPtr)
  BEQ V0 R0 loop
  NOP

  LW RA 0x18(SP)
  JR RA
`)
// ArrayBuffer<
//   27BDFFE0  ADDIU SP SP 0xFFE0
//   AFBF0018  SW RA 0x18(SP)
//   3C048034  LUI A0 0x8034
//   0C0410C8  JAL 0x80104321
//   2484C000  ADDIU A0 A0 0xC000
//   1040FFFD  BEQ V0 R0 -3
//   00000000  NOP
//   8FBF0018  LW RA 0x18(SP)
//   03E00008  JR RA
// >
```

The default return value is an ArrayBuffer.

Passing `{ buffer: someArrayBuffer }` as the second argument will cause assembly to be performed on the given buffer, rather than creating a new buffer.

For debugging, you can pass `{ text: true }` as the second argument to `assemble` and it will instead output the instructions in text format, similar to the format shown beside the ArrayBuffer example above.

The bundled UMD module exports a `MIPSAssem` global.

Features
--------

### Labels

Labels can be used to reference locations by name.

```
main:
    ADDIU SP SP -32
    ...
loop:
    JAL 0x80023456
    ...
```

They can be on their own line, or on the same line as other instructions or labels. Labels can contain letters, numbers, underscores, `?` or `!`.

```
main:
main2: start: ADDIU SP SP -32
    ...
loop?!: JAL 0x80023456
    ...
```

### Directives

| Directive | Description |
|-----------|-------------|
| `.ascii value[,...]` | Writes a sequence of characters or bytes. Each parameter can be any expression that evaluates to an integer or a string. If it evaluates to an integer, only the lowest 8 bits are inserted. If it evaluates to a string, every character is inserted as a byte. |
| `.asciiz value[,...]` | Like `.ascii` but a single null terminator is inserted after the values. |
| `.align num` | Writes zeros into the output file until the output position is a multiple of `num`. `num` has to be a power of two. |
| `.byte value[,...]`<br/>`.db value[,...]` | Writes a sequence of bytes. Only the lowest 8 bits are inserted. |
| `.definelabel label,value` | Defines `label` with a given value, creating a symbol for it. |
| `.fill length[,value]` | Inserts `length` amount of bytes of `value`. If `value` isn't specified, zeros are inserted. Only the lowest 8 bits of `value` are inserted. |
| `.float value[,...]` | Writes a sequence of single-precision floats. |
| `.halfword value[,...]`<br/>`.dh value[,...]` | Writes a sequence of 16-bit values. Only the lowest 16 bits are inserted. |
| `.org RamAddress` | Adjusts the working memory location the assembly. This affects individual instructions, but not the locations where they are outputted. |
| `.orga BufferOffset` | Sets the output pointer to the specified offset. This affects the location that subsequent instructions are written to, but doesn't affect individual instructions. |
| `.skip length` | Skips `length` amount of bytes without overwriting them. |
| `.word value[,...]`<br/>`.dw value[,...]` | Writes a sequence of 32-bit values. Only the lowest 32 bits are inserted. |

### Built-in functions

These functions can be used in place of immediates, and can be passed symbols/labels instead of just immediates.

| Function | Description |
|----------|-------------|
| `hi(val)` | High half of 32-bit value `val`, adjusted for sign extension of low half (MIPS) |
| `lo(val)` | Sign-extended low half of 32-bit value `val` (MIPS) |

### Comments

Comments can be specified with either `;` or `//`.

Development
-----------

To build:
```
npm install
npm run build
```

To run tests:
```
npm test
```

License
-------

MIT