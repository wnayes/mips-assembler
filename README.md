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

For debugging, you can pass `{ text: true }` as the second argument to `assemble` and it will instead output the instructions in text format, similar to the format shown beside the ArrayBuffer example above.

The bundled UMD module exports a `MIPSAssem` global.

Features
--------

### Labels

Labels should be on their own line. No instructions should be included on the same line.

```
main:
   ...
loop:
   ...
```

### Directives

| Directive | Description |
|----------|-------------|
| `.org RamAddress` | Sets the output pointer to the specified address. |
| `.definelabel label,value` | Defines `label` with a given value, creating a symbol for it. |

### Built-in functions

These functions can be used in place of immediates, and can be passed symbols/labels instead of just immediates.

| Function | Description |
|----------|-------------|
| `hi(val)` | High half of 32-bit value `val`, adjusted for sign extension of low half (MIPS) |
| `lo(val)` | Sign-extended low half of 32-bit value `val` (MIPS) |

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