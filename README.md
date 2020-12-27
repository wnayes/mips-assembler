mips-assembler
==============

[![npm version](https://badge.fury.io/js/mips-assembler.svg)](https://www.npmjs.com/package/mips-assembler)

Simple MIPS IV assembler for JavaScript.

The features that are included are compatible with [armips](https://github.com/Kingcom/armips), when possible. `armips` is much more sophisticated currently though.

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

An `opts` object can be passed as the second parameter. It can contain various properties to affect behavior.

| Option | Description |
|---|---|
| `buffer` | (ArrayBuffer) When passed, assembly will be performed on the given buffer, rather than creating a new buffer. |
| `files` | (Object) Used with the `include` file directive, see below. |
| `text` | (String) Output will be instructions in text format, similar to the format shown beside the ArrayBuffer above. |
| `symbolOutputMap` | (Object) If you pass an object on this property, it will be filled with a map from symbol name to the output location of that symbol.<br /><br />For example, if you labeled a `.word` as `my_number` and that number was output to buffer offset `0x100`, the `symbolOutputMap` would be `{ "my_number": 0x100 }`. |

The UMD module in `dist/umd` exports a `MIPSAssem` global.

Features
--------

### Labels

Labels can be used to reference locations by name. Labels are global by default.

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

If a label starts with `@@`, it is a local label and only can be defined and used in the area between the two nearest global labels.

```
; The example from armips...
GlobalLabel:       ; This is a global label
@@LocalLabel:      ; This is a local label, it is only
                   ; valid until the next global one
OtherGlobalLabel:  ; this will terminate the area where
                   ; @@LocalLabel can be used
j @@LocalLabel     ; as a result, this will cause an error
```

If a label starts with a single `@`, it is a static label. Static labels act like global labels, but are only visible to the current "file." See the `include` or `beginfile`/`endfile` directives.

### Directives

#### General directives

##### Set the memory position

```
.org RamAddress
```

Adjusts the working memory location the assembly. This affects individual instructions, but not the locations where they are outputted.

##### Set the output position

```
.orga BufferOffset
```

Sets the output pointer to the specified offset. This affects the location that subsequent instructions are written to, but doesn't affect individual instructions.

##### Create labels

```
.definelabel label,value
```

Defines `label` with a given value, creating a symbol for it.

##### Include another assembly file

```
.include "filename"
```

Inlines a "file" containing assembly at the current location.

Note that, since we're in JavaScript, the "filename" is not a path to an actual file. It should be a key in the `files` object that can be passed through the `assemble` opts.

```
assemble(`
  .org 0x80001000
  .include "external"
`, {
  files: {
    "external": `
      ADDIU A0 R0 123
      .ascii "This is the external 'file'"
    `
  }
});
```

##### File scoping

```
.beginfile
.endfile
```

If you want to achieve file scoping without actually having separate assembly in the `files` opt object, you can surround assembly with `.beginfile` and `.endfile`. This would enable usage of static labels for example.


##### `equ`

Limited support is available for `equ` direct text replacements.

```
NumList equ 1,2,3,4

.word NumList
```

As with regular symbols, these are global replacements by default. A single leading `@` creates a static replacement, and two leading `@@` creates a local replacement.


####  Text and data directives

##### Align the output position

```
.align num
```

Writes zeros into the output file until the output position is a multiple of `num`. `num` has to be a power of two.

##### Fill space with a value

```
.fill length[,value]
```

Inserts `length` amount of bytes of `value`. If `value` isn't specified, zeros are inserted. Only the lowest 8 bits of `value` are inserted.

##### Skip bytes

```
.skip length
```

Skips `length` amount of bytes without overwriting them.

##### Write bytes

```
.byte value[,...]
.db value[,...]
```

Writes a sequence of bytes. Only the lowest 8 bits are inserted.

##### Write halfwords

```
.halfword value[,...]
.dh value[,...]
```

Writes a sequence of 16-bit values. Only the lowest 16 bits are inserted.

##### Write words

```
.word value[,...]
.dw value[,...]
```

Writes a sequence of 32-bit values. Only the lowest 32 bits are inserted.

##### Write floating point numbers

```
.float value[,...]
```

 Writes a sequence of single-precision floats.

##### Write text

```
.ascii value[,...]
.asciiz value[,...]
```

Writes a sequence of characters or bytes. Each parameter can be any expression that evaluates to an integer or a string. If it evaluates to an integer, only the lowest 8 bits are inserted. If it evaluates to a string, every character is inserted as a byte.

With `asciiz`, a single null terminator is inserted after the values.

#### Conditional directives

##### Begin a conditional block

```
.if cond
```

The content of a conditional block will only be used if the condition is met. In the case of `.if`, it is met of `cond` evaluates to non-zero integer.

##### Else case of a conditional block

```
.else
.elseif cond
```

The else block is used if the condition of the condition of the if block was not met. `.else` unconditionally inserts the content of the else block, while the others start a new if block and work as described before.

##### End a conditional block

```
.endif
```

Ends the last open if or else block.

### Macros

Also known as "pseudo-instructions."

#### Immediate macros

```
li reg,value
```

Loads the `value` into the specified register using the appropriate combination of `lui`, `addiu`, or `ori`.

#### Register macros

```
move dest,reg
```

Copies the contents of `reg` into `dest` using an `addu`.

#### Branch macros

```
beqz  reg,dest
bnez  reg,dest
bnezl reg,dest
```

### Built-in functions

These functions can be used in place of immediates, and can be passed symbols/labels instead of just immediates.

| Function | Description |
|----------|-------------|
| `abs(value)` | Absolute value of `value` |
| `hi(value)` | High half of 32-bit value `value`, adjusted for sign extension of low half |
| `lo(value)` | Sign-extended low half of 32-bit value `value` |
| `org()` | Current memory address |

### Comments

Both `;` and `//` single-line comments are supported. `/* */` block comments are also supported.

Development
-----------

To build:
```
npm install
npm run build
```

To run tests:
```
npm run test
```

License
-------

MIT