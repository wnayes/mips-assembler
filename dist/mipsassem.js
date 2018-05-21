(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["MIPSAssem"] = factory();
	else
		root["MIPSAssem"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parseImmediate;
function parseImmediate(value) {
    if (typeof value !== "string")
        return null;
    var result;
    if (value[0] === "b" || value[0] === "0" && value[1] === "b")
        result = parseInt(value.substr(2), 2);
    else if (value[0] === "o" || value[0] === "0" && value[1] === "o")
        result = parseInt(value.substr(2), 8);
    else if (value[0] === "x" || value[0] === "0" && value[1] === "x")
        result = parseInt(value.substr(2), 16);
    else
        result = parseInt(value, 10);
    return isNaN(result) ? null : result;
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AssemblerPhase; });
var AssemblerPhase;
(function (AssemblerPhase) {
    AssemblerPhase[AssemblerPhase["firstPass"] = 0] = "firstPass";
    AssemblerPhase[AssemblerPhase["secondPass"] = 1] = "secondPass";
})(AssemblerPhase || (AssemblerPhase = {}));


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__assembler__ = __webpack_require__(3);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "assemble", function() { return __WEBPACK_IMPORTED_MODULE_0__assembler__["a"]; });



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = assemble;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_mips_inst__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_mips_inst___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_mips_inst__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__types__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__directives__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__functions__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__immediates__ = __webpack_require__(0);





function assemble(input, opts) {
    opts = opts || {};
    var arr = _ensureArray(input);
    arr = arr.filter(function (s) { return typeof s === "string"; });
    arr = _stripComments(arr);
    arr = arr.map(function (s) { return s.trim(); });
    arr = arr.filter(Boolean);
    var state = _makeNewAssemblerState();
    var outStrs = [];
    // First pass, calculate label positions.
    arr = arr.filter(function (line) {
        state.line = line;
        if (line[0] === ".") {
            Object(__WEBPACK_IMPORTED_MODULE_2__directives__["a" /* handleDirective */])(state);
            return true; // Keep directives for second pass.
        }
        if (_parseGlobalLabel(state)) {
            return false; // State was updated, can filter the label out.
        }
        state.outIndex += 4; // Well, this better be a typical instruction!
        return true;
    });
    state.buffer = opts.buffer || new ArrayBuffer(state.outIndex);
    state.dataView = new DataView(state.buffer);
    state.memPos = 0;
    state.outIndex = 0;
    state.currentPass = __WEBPACK_IMPORTED_MODULE_1__types__["a" /* AssemblerPhase */].secondPass;
    // Second pass, assemble!
    arr.forEach(function (line) {
        state.line = line;
        if (line[0] === ".") {
            Object(__WEBPACK_IMPORTED_MODULE_2__directives__["a" /* handleDirective */])(state);
            return;
        }
        // Apply any built-in functions, symbols.
        var instPieces = line.split(/[,\s]+/g);
        if (instPieces.length) {
            var lastPiece = Object(__WEBPACK_IMPORTED_MODULE_3__functions__["a" /* runFunction */])(instPieces[instPieces.length - 1], state);
            if (lastPiece !== null) {
                lastPiece = _fixBranch(instPieces[0], lastPiece, state);
                instPieces[instPieces.length - 1] = lastPiece;
                line = instPieces.join(" ");
            }
        }
        if (opts.text)
            outStrs.push(line);
        // At this point, we should be able to parse the instruction.
        var inst = Object(__WEBPACK_IMPORTED_MODULE_0_mips_inst__["parse"])(line);
        state.dataView.setUint32(state.outIndex, inst);
        state.outIndex += 4;
    });
    if (opts.text)
        return outStrs;
    return state.buffer;
}
/** Strips single line ; or // comments. */
function _stripComments(input) {
    return input.map(function (line) {
        var semicolonIndex = line.indexOf(";");
        var slashesIndex = line.indexOf("//");
        if (semicolonIndex === -1 && slashesIndex === -1)
            return line; // No comments
        var removalIndex = semicolonIndex;
        if (removalIndex === -1)
            removalIndex = slashesIndex;
        else if (slashesIndex !== -1)
            removalIndex = Math.min(semicolonIndex, slashesIndex);
        return line.substr(0, removalIndex);
    });
}
/** Parses a LABEL: expression and adds it to the symbol table. */
function _parseGlobalLabel(state) {
    var labelRegex = /^(\w+)\:\s*$/;
    var results = state.line.match(labelRegex);
    if (results === null)
        return false; // Not a label.
    var name = results[1];
    state.symbols[name] = (state.memPos + state.outIndex) >>> 0;
    return true;
}
/** Transforms branches from absolute to relative. */
function _fixBranch(inst, offset, state) {
    if (_instIsBranch(inst)) {
        var imm = Object(__WEBPACK_IMPORTED_MODULE_4__immediates__["a" /* parseImmediate */])(offset); // Should definitely succeed.
        var memOffset = state.memPos + state.outIndex;
        var diff = (imm - memOffset) / 4;
        return diff.toString(); // base 10 ok
    }
    return offset; // Leave as is.
}
function _instIsBranch(inst) {
    inst = inst.toLowerCase();
    if (inst[0] !== "b")
        return false;
    switch (inst) {
        case "bc1f":
        case "bc1fl":
        case "bc1t":
        case "bc1tl":
        case "beq":
        case "beql":
        case "bgez":
        case "bgezal":
        case "bgezall":
        case "bgezl":
        case "bgtz":
        case "bgtzl":
        case "blez":
        case "blezl":
        case "bltz":
        case "bltzal":
        case "bltzall":
        case "bltzl":
        case "bne":
        case "bnel":
            return true;
    }
    return false;
}
function _makeNewAssemblerState() {
    return {
        buffer: null,
        dataView: null,
        line: "",
        memPos: 0,
        outIndex: 0,
        symbols: Object.create(null),
        currentPass: __WEBPACK_IMPORTED_MODULE_1__types__["a" /* AssemblerPhase */].firstPass,
    };
}
function _ensureArray(input) {
    if (typeof input === "string")
        return input.split(/\r?\n/);
    if (!Array.isArray(input))
        throw new Error("Input must be a string or array of strings");
    return input;
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["MIPSInst"] = factory();
	else
		root["MIPSInst"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["h"] = getRegBits;
/* harmony export (immutable) */ __webpack_exports__["i"] = getRegName;
/* harmony export (immutable) */ __webpack_exports__["c"] = getFloatRegName;
/* harmony export (immutable) */ __webpack_exports__["f"] = getFmtBits;
/* harmony export (immutable) */ __webpack_exports__["g"] = getFmtName;
/* harmony export (immutable) */ __webpack_exports__["d"] = getFmt3Bits;
/* harmony export (immutable) */ __webpack_exports__["e"] = getFmt3Name;
/* harmony export (immutable) */ __webpack_exports__["k"] = isFmtString;
/* harmony export (immutable) */ __webpack_exports__["a"] = getCondBits;
/* harmony export (immutable) */ __webpack_exports__["b"] = getCondName;
/* harmony export (immutable) */ __webpack_exports__["j"] = isCondString;
const regs = {
  r0: 0,
  zero: 0,
  at: 1,
  v0: 2,
  v1: 3,
  a0: 4,
  a1: 5,
  a2: 6,
  a3: 7,
  t0: 8,
  t1: 9,
  t2: 10,
  t3: 11,
  t4: 12,
  t5: 13,
  t6: 14,
  t7: 15,
  s0: 16,
  s1: 17,
  s2: 18,
  s3: 19,
  s4: 20,
  s5: 21,
  s6: 22,
  s7: 23,
  t8: 24,
  t9: 25,
  k0: 26,
  k1: 27,
  gp: 28,
  sp: 29,
  fp: 30,
  ra: 31
};

function getRegBits(reg) {
  if (!reg)
    return undefined;
  return regs[reg.toLowerCase()];
}

function getRegName(bits) {
  for (let name in regs) {
    if (regs[name] === bits)
      return name;
  }
  return "";
}

function getFloatRegName(bits) {
  if (typeof bits !== "number")
    throw new Error("getFloatRegName encountered non-number");

  return "F" + bits;
}

const fmts = {
  S: 16,
  D: 17,
  W: 20,
  L: 21,
};

function getFmtBits(fmtStr) {
  return fmts[fmtStr.toUpperCase()];
}

function getFmtName(bits) {
  for (let name in fmts) {
    if (fmts[name] === bits)
      return name;
  }
  return "";
}

const fmt3s = {
  S: 0,
  D: 1,
  W: 4,
  L: 5,
};

function getFmt3Bits(fmtStr) {
  return fmt3s[fmtStr.toUpperCase()];
}

function getFmt3Name(bits) {
  for (let name in fmt3s) {
    if (fmt3s[name] === bits)
      return name;
  }
  return "";
}

function isFmtString(fmtStr) {
  return fmts.hasOwnProperty(fmtStr.toUpperCase()) || fmt3s.hasOwnProperty(fmtStr.toUpperCase());
}

const conds = {
  F: 0,
  UN: 1,
  EQ: 2,
  UEQ: 3,
  OLT: 4,
  ULT: 5,
  OLE: 6,
  ULE: 7,
  SF: 8,
  NGLE: 9,
  SEQ: 10,
  NGL: 11,
  LT: 12,
  NGE: 13,
  LE: 14,
  NGT: 15,
};

function getCondBits(condStr) {
  return conds[condStr.toUpperCase()];
}

function getCondName(bits) {
  for (let name in conds) {
    if (conds[name] === bits)
      return name;
  }
  return "";
}

function isCondString(condStr) {
  return conds.hasOwnProperty(condStr.toUpperCase());
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = parseImmediate;
/* unused harmony export formatImmediate */
/* harmony export (immutable) */ __webpack_exports__["b"] = makeInt16;
/* harmony export (immutable) */ __webpack_exports__["a"] = getImmFormatDetails;
function parseImmediate(immArr, maxBits, signed, shift) {
  let [neg, base, num] = immArr;
  base = base.toLowerCase();

  let value;
  if (base === "b")
    value = parseInt(num, 2);
  else if (base === "o")
    value = parseInt(num, 8);
  else if (base === "x")
    value = parseInt(num, 16);
  else
    value = parseInt(num, 10);

  if (shift) {
    value >>>= shift;
  }

  if (maxBits === 16) {
    if (signed) {
      value = makeInt16(value);
    }
  }

  if (neg)
    value = -value;

  return value;
}

function formatImmediate(value, maxBits) {
  if (maxBits === 16) {
    value = (new Uint16Array([value]))[0];
  }

  return value;
}

function makeInt16(value) {
  return (new Int16Array([value]))[0];
}

function getImmFormatDetails(formatVal) {
  // Remove optional indicator
  if (formatVal[formatVal.length - 1] === "?")
    formatVal = formatVal.substring(0, formatVal.length - 1);

  if (formatVal.indexOf("int") === -1) {
    if (formatVal.substr(0, 2) === "cc") {
      return {
        signed: false,
        bits: 4,
        shift: false,
      };
    }

    return null; // Not an immediate
  }

  let shift = 0;
  const shiftIndex = formatVal.indexOf("shift");
  if (shiftIndex > 0)
    shift = formatVal.substr(shiftIndex).match(/\d+/g);

  return {
    signed: formatVal[0] !== "u",
    bits: parseInt(formatVal.match(/\d+/g)),
    shift: shift,
  };
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = isBinaryLiteral;
/* harmony export (immutable) */ __webpack_exports__["a"] = compareBits;
/* harmony export (immutable) */ __webpack_exports__["d"] = makeBitMaskFromString;
/* harmony export (immutable) */ __webpack_exports__["c"] = makeBitMask;
/* harmony export (immutable) */ __webpack_exports__["e"] = padBitString;
function isBinaryLiteral(str) {
  return str[0] === "0" || str[0] === "1"; // Checking first char is enough for now
}

function compareBits(number, bitString, bitOffset) {
  let shifted = (number >>> bitOffset) & makeBitMask(bitString.length);
  let mask = makeBitMaskFromString(bitString);
  return shifted === mask;
}

function makeBitMaskFromString(bitString) {
  let mask = 0;
  for (var i = 0; i < bitString.length; i++) {
    let bit = bitString[i] === "1" ? 1 : 0;
    mask <<= 1;
    mask = mask | bit;
  }
  return mask;
}

function makeBitMask(len) {
  if (len <= 0)
    throw new Error(`makeBitMask cannot make mask of length ${len}`);

  let mask = 1;
  while (--len) {
    mask <<= 1;
    mask = mask | 1;
  }
  return mask;
}

function padBitString(str, minLen) {
  while (str.length < minLen) {
    str = "0" + str;
  }
  return str;
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = getOpcodeDetails;
/* harmony export (immutable) */ __webpack_exports__["c"] = getValueBitLength;
/* harmony export (immutable) */ __webpack_exports__["a"] = findMatch;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__regs__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__bitstrings__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__immediates__ = __webpack_require__(1);




const rs = "rs";
const rt = "rt";
const rd = "rd";
const fs = "fs";
const ft = "ft";
const fd = "fd";
const fr = "fr";
const sa = "uint5";
const uint5 = "uint5";
const uint10 = "uint10";
const int16 = "int16";
const uint16 = "uint16";
const uint20 = "uint20";
const uint26 = "uint26";
const uint26shift2 = "uint26shift2";
const cc = "cc";
const cond = "cond";
const fmt = "fmt";
const fmt3 = "fmt3";

function getOpcodeDetails(opcode) {
  return opcodeDetails[opcode.toLowerCase()];
}

function getValueBitLength(str) {
  if (__WEBPACK_IMPORTED_MODULE_1__bitstrings__["b" /* isBinaryLiteral */](str))
    return str.length;

  str = str.replace("?", "");
  switch (str) {
    case "cc":
    case "fmt3":
      return 3;

    case "cond":
      return 4;

    case "rs":
    case "rt":
    case "rd":
    case "fs":
    case "ft":
    case "fd":
    case "fr":
    case "sa":
    case "fmt":
      return 5;
  }

  const immDetails = __WEBPACK_IMPORTED_MODULE_2__immediates__["a" /* getImmFormatDetails */](str);
  if (immDetails) {
    return immDetails.bits;
  }

  throw new Error(`Unrecongized format value: ${str}`);
}

// returns name
function findMatch(inst) {
  let bestMatch = "";
  let bestMatchScore = 0;
  for (let opName in opcodeDetails) {
    const format = opcodeDetails[opName].format;
    const fmts = opcodeDetails[opName].fmts;
    const score = formatMatches(inst, format, fmts);
    if (score > bestMatchScore) {
      bestMatch = opName;
      bestMatchScore = score;
    }
  }

  return bestMatch;
}

// Returns number of literal bits matched, if the overall format matches.
function formatMatches(number, format, fmts) {
  let score = 0;
  let tempScore;
  let bitOffset = 0;
  for (let i = format.length - 1; i >= 0; i--) {
    let bitLength;
    let piece = format[i];
    if (Array.isArray(piece)) {
      let matchedOne = false;
      for (let j = 0; j < piece.length; j++) {
        tempScore = checkPiece(piece[j], number, bitOffset, fmts);
        if (tempScore >= 0) {
          matchedOne = true;
          score += tempScore;
          bitLength = getValueBitLength(piece[j]);
          break; // j
        }
      }
      if (!matchedOne)
        return 0;
    }
    else {
      tempScore = checkPiece(piece, number, bitOffset, fmts);
      if (tempScore >= 0) {
        score += tempScore;
        bitLength = getValueBitLength(piece);
      }
      else {
        return 0;
      }
    }

    bitOffset += bitLength;
  }

  return score;
}

function checkPiece(piece, number, bitOffset, fmts) {
  if (!__WEBPACK_IMPORTED_MODULE_1__bitstrings__["b" /* isBinaryLiteral */](piece)) {
    if (piece === fmt) {
      for (let i = 0; i < fmts.length; i++) {
        let fmtBitString = __WEBPACK_IMPORTED_MODULE_1__bitstrings__["e" /* padBitString */](__WEBPACK_IMPORTED_MODULE_0__regs__["f" /* getFmtBits */](fmts[i]).toString(2), 5);
        if (__WEBPACK_IMPORTED_MODULE_1__bitstrings__["a" /* compareBits */](number, fmtBitString, bitOffset))
          return fmtBitString.length;
      }
      return -1;
    }

    if (piece === fmt3) {
      for (let i = 0; i < fmts.length; i++) {
        let fmtBitString = __WEBPACK_IMPORTED_MODULE_1__bitstrings__["e" /* padBitString */](__WEBPACK_IMPORTED_MODULE_0__regs__["d" /* getFmt3Bits */](fmts[i]).toString(2), 3);
        if (__WEBPACK_IMPORTED_MODULE_1__bitstrings__["a" /* compareBits */](number, fmtBitString, bitOffset))
          return fmtBitString.length;
      }
      return -1;
    }

    return 0; // non-literal contributes nothing
  }

  if (__WEBPACK_IMPORTED_MODULE_1__bitstrings__["a" /* compareBits */](number, piece, bitOffset))
    return piece.length;

  return -1;
}

const opcodeDetails = {
  "abs.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "000101"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  add: {
    format: ["000000", rs, rt, rd, "00000100000"],
    display: [rd, rs, rt],
  },
  "add.fmt": {
    format: ["010001", fmt, ft, fs, fd, "000000"],
    fmts: ["S", "D"],
    display: [fd, fs, ft],
  },
  addi: {
    format: ["001000", rs, rt, int16],
    display: [rt, rs, int16],
  },
  addiu: {
    format: ["001001", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  addu: {
    format: ["000000", rs, rt, rd, "00000100001"],
    display: [rd, rs, rt],
  },
  and: {
    format: ["000000", rs, rt, rd, "00000100100"],
    display: [rd, rs, rt],
  },
  andi: {
    format: ["001100", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  bc1f: {
    format: ["010001", "01000", [cc, "000"], "00", int16], // TODO shifting?
    display: ["cc?", int16], // offset
  },
  bc1fl: {
    format: ["010001", "01000", [cc, "000"], "10", int16],
    display: ["cc?", int16], // offset
  },
  bc1t: {
    format: ["010001", "01000", [cc, "000"], "01", int16],
    display: ["cc?", int16], // offset
  },
  bc1tl: {
    format: ["010001", "01000", [cc, "000"], "11", int16],
    display: ["cc?", int16], // offset
  },
  beq: {
    format: ["000100", rs, rt, uint16],
    display: [rs, rt, uint16], // offset
  },
  beql: {
    format: ["010100", rs, rt, uint16],
    display: [rs, rt, uint16], // offset
  },
  bgez: {
    format: ["000001", rs, "00001", uint16],
    display: [rs, uint16], // offset
  },
  bgezal: {
    format: ["000001", rs, "10001", uint16],
    display: [rs, uint16], // offset
  },
  bgezall: {
    format: ["000001", rs, "10011", uint16],
    display: [rs, uint16], // offset
  },
  bgezl: {
    format: ["000001", rs, "00011", uint16],
    display: [rs, uint16], // offset
  },
  bgtz: {
    format: ["000111", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  bgtzl: {
    format: ["010111", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  blez: {
    format: ["000110", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  blezl: {
    format: ["010110", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  bltz: {
    format: ["000001", rs, "00000", uint16],
    display: [rs, uint16], // offset
  },
  bltzal: {
    format: ["000001", rs, "10000", uint16],
    display: [rs, uint16], // offset
  },
  bltzall: {
    format: ["000001", rs, "10010", uint16],
    display: [rs, uint16], // offset
  },
  bltzl: {
    format: ["000001", rs, "00010", uint16],
    display: [rs, uint16], // offset
  },
  bne: {
    format: ["000101", rs, rt, uint16],
    display: [rs, rt, uint16], // offset
  },
  bnel: {
    format: ["010101", rs, rt, uint16],
    display: [rs, rt, uint16], // offset
  },
  break: {
    format: ["000000", [uint20, "00000000000000000000"], "001101"],
    display: [],
  },
  "c.cond.fmt": {
    format: ["010001", fmt, ft, fs, [cc, "000"], "00", "11", cond],
    fmts: ["S", "D"],
    display: ["cc?", fs, ft],
  },
  "ceil.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001010"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "ceil.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001110"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  cfc1: {
    format: ["010001", "00010", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  ctc1: {
    format: ["010001", "00110", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  cop0: {
    format: ["010000", uint26],
    display: [uint26], // cop_fun
  },
  cop1: {
    format: ["010001", uint26],
    display: [uint26], // cop_fun
  },
  cop2: {
    format: ["010010", uint26],
    display: [uint26], // cop_fun
  },
  cop3: {
    format: ["010011", uint26],
    display: [uint26], // cop_fun
  },
  "cvt.d.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "100001"],
    fmts: ["S", "W", "L"],
    display: [fd, fs],
  },
  "cvt.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "100101"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "cvt.s.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "100000"],
    fmts: ["D", "W", "L"],
    display: [fd, fs],
  },
  "cvt.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "100100"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  dadd: {
    format: ["000000", rs, rt, rd, "00000101100"],
    display: [rd, rs, rt],
  },
  daddi: {
    format: ["011000", rs, rt, int16],
    display: [rt, rs, int16],
  },
  daddiu: {
    format: ["011001", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  daddu: {
    format: ["000000", rs, rt, rd, "00000101101"],
    display: [rd, rs, rt],
  },
  ddiv: {
    format: ["000000", rs, rt, "0000000000011110"],
    display: [rs, rt],
  },
  ddivu: {
    format: ["000000", rs, rt, "0000000000011111"],
    display: [rs, rt],
  },
  div: {
    format: ["000000", rs, rt, "0000000000011010"],
    display: [rs, rt],
  },
  "div.fmt": {
    format: ["010001", fmt, ft, fs, fd, "000011"],
    fmts: ["S", "D"],
    display: [fd, fs, ft],
  },
  divu: {
    format: ["000000", rs, rt, "0000000000011011"],
    display: [rs, rt],
  },
  dmfc1: {
    format: ["010001", "00001", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  dmult: {
    format: ["000000", rs, rt, "0000000000011100"],
    display: [rs, rt],
  },
  dmultu: {
    format: ["000000", rs, rt, "0000000000011101"],
    display: [rs, rt],
  },
  dmtc1: {
    format: ["010001", "00101", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  dsll: {
    format: ["00000000000", rt, rd, sa, "111000"],
    display: [rd, rt, sa],
  },
  dsll32: {
    format: ["00000000000", rt, rd, sa, "111100"],
    display: [rd, rt, sa],
  },
  dsllv: {
    format: ["000000", rs, rt, rd, "00000010100"],
    display: [rd, rt, rs],
  },
  dsra: {
    format: ["00000000000", rt, rd, sa, "111011"],
    display: [rd, rt, sa],
  },
  dsra32: {
    format: ["00000000000", rt, rd, sa, "111111"],
    display: [rd, rt, sa],
  },
  dsrav: {
    format: ["000000", rs, rt, rd, "00000010111"],
    display: [rd, rt, rs],
  },
  dsrl: {
    format: ["00000000000", rt, rd, sa, "111010"],
    display: [rd, rt, sa],
  },
  dsrl32: {
    format: ["00000000000", rt, rd, sa, "111110"],
    display: [rd, rt, sa],
  },
  dsrlv: {
    format: ["000000", rs, rt, rd, "00000010110"],
    display: [rd, rt, rs],
  },
  dsub: {
    format: ["000000", rs, rt, rd, "00000101110"],
    display: [rd, rs, rt],
  },
  dsubu: {
    format: ["000000", rs, rt, rd, "00000101111"],
    display: [rd, rs, rt],
  },
  "floor.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001011"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "floor.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001111"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  j: {
    format: ["000010", uint26shift2],
    display: [uint26shift2],
  },
  jal: {
    format: ["000011", uint26shift2],
    display: [uint26shift2],
  },
  jalr: {
    format: ["000000", rs, "00000", [rd, "11111"], "00000", "001001"],
    display: ["rd?", rs],
  },
  jr: {
    format: ["000000", rs, "000000000000000", "001000"],
    display: [rs],
  },
  lb: {
    format: ["100000", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lbu: {
    format: ["100100", rs, rt, uint16],
    display: [rt, uint16, "(", rs, ")"], // offset
  },
  ld: {
    format: ["110111", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ldc1: {
    format: ["110101", rs, ft, int16],
    display: [ft, int16, "(", rs, ")"], // offset
  },
  ldc2: {
    format: ["110110", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ldl: {
    format: ["011010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ldr: {
    format: ["011011", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ldxc1: {
    format: ["010011", rs, rt, "00000", fd, "000001"],
    display: [fd, rt, "(", rs, ")"], // offset
  },
  lh: {
    format: ["100001", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lhu: {
    format: ["100101", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  ll: {
    format: ["110000", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lld: {
    format: ["110100", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lui: {
    format: ["001111", "00000", rt, uint16],
    display: [rt, uint16],
  },
  lw: {
    format: ["100011", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwc1: {
    format: ["110001", rs, ft, int16],
    display: [ft, int16, "(", rs, ")"], // offset
  },
  lwc2: {
    format: ["110010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwc3: {
    format: ["110011" ,rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwl: {
    format: ["100010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwr: {
    format: ["100110", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwu: {
    format: ["100111", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  lwxc1: {
    format: ["010011", rs, rt, "00000", fd, "000000"],
    display: [fd, rt, "(", rs, ")"],
  },
  "madd.fmt": {
    format: ["010011", fr, ft, fs, fd, "100", fmt3],
    fmts: ["S", "D"],
    display: [fd, fr, fs, ft],
  },
  mfc1: {
    format: ["010001", "00000", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  mfhi: {
    format: ["000000", "0000000000", rd, "00000", "010000"],
    display: [rd],
  },
  mflo: {
    format: ["000000", "0000000000", rd, "00000", "010010"],
    display: [rd],
  },
  "mov.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "000110"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  movf: {
    format: ["000000", rs, cc, "00", rd, "00000", "000001"],
    display: [rd, rs, cc],
  },
  "movf.fmt": {
    format: ["010001", fmt, cc, "00", fs, fd, "010001"],
    fmts: ["S", "D"],
    display: [fd, fs, cc],
  },
  movn: {
    format: ["000000", rs, rt, rd, "00000", "001011"],
    display: [rd, rs, rt],
  },
  "movn.fmt": {
    format: ["010001", fmt, rt, fs, fd, "010011"],
    fmts: ["S", "D"],
    display: [fd, fs, rt],
  },
  movt: {
    format: ["000000", rs, cc, "01", rd, "00000", "000001"],
    display: [rd, rs, cc],
  },
  "movt.fmt": {
    format: ["010001", fmt, cc, "01", fs, fd, "010001"],
    fmts: ["S", "D"],
    display: [fd, fs, cc],
  },
  movz: {
    format: ["000000", rs, rt, rd, "00000", "001010"],
    display: [rd, rs, rt],
  },
  "movz.fmt": {
    format: ["010001", fmt, rt, fs, fd, "010010"],
    fmts: ["S", "D"],
    display: [fd, fs, rt],
  },
  "msub.fmt": {
    format: ["010011", fr, ft, fs, fd, "101", fmt3],
    fmts: ["S", "D"],
    display: [fd, fr, fs, ft],
  },
  mtc1: {
    format: ["010001", "00100", rt, fs, "00000000000"],
    display: [rt, fs],
  },
  mthi: {
    format: ["000000", rs, "000000000000000", "010001"],
    display: [rs],
  },
  mtlo: {
    format: ["000000", rs, "000000000000000", "010011"],
    display: [rs],
  },
  "mul.fmt": {
    format: ["010001", fmt, ft, fs, fd, "000010"],
    fmts: ["S", "D"],
    display: [fd, fs, ft],
  },
  mult: {
    format: ["000000", rs, rt, "0000000000", "011000"],
    display: [rs, rt],
  },
  multu: {
    format: ["000000", rs, rt, "0000000000", "011001"],
    display: [rs, rt],
  },
  "neg.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "000111"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "nmadd.fmt": {
    format: ["010011", fr, ft, fs, fd, "110", fmt3],
    fmts: ["S", "D"],
    display: [fd, fr, fs, ft],
  },
  "nmsub.fmt": {
    format: ["010011", fr, ft, fs, fd, "111", fmt3],
    fmts: ["S", "D"],
    display: [fd, fr, fs, ft],
  },
  nop: {
    format: ["00000000000000000000000000000000"],
    display: [],
  },
  nor: {
    format: ["000000", rs, rt, rd, "00000", "100111"],
    display: [rd, rs, rt],
  },
  or: {
    format: ["000000", rs, rt, rd, "00000", "100101"],
    display: [rd, rs, rt],
  },
  ori: {
    format: ["001101", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  pref: {
    format: ["110011", rs, uint5, int16],
    display: [uint5, int16, "(", rs, ")"], // hint, offset, base
  },
  prefx: {
    format: ["010011", rs, rt, uint5, "00000", "001111"],
    display: [uint5, rt, "(", rs, ")"], // hint, index, base
  },
  "recip.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "010101"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "round.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001000"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "round.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001100"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "rsqrt.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "010110"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  sb: {
    format: ["101000", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sc: {
    format: ["111000", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  scd: {
    format: ["111100", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sd: {
    format: ["111111", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sdc1: {
    format: ["111101", rs, ft, int16],
    display: [ft, int16, "(", rs, ")"], // offset
  },
  sdc2: {
    format: ["111110", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sdl: {
    format: ["101100", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sdr: {
    format: ["101101", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sdxc1: {
    format: ["010011", rs, uint5, fs, "00000", "001001"],
    display: [fs, uint5, "(", rs, ")"],
  },
  sh: {
    format: ["101001", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"], // offset
  },
  sll: {
    format: ["000000", "00000", rt, rd, sa, "000000"],
    display: [rd, rt, sa],
  },
  sllv: {
    format: ["000000", rs, rt, rd, "00000", "000100"],
    display: [rd, rt, rs],
  },
  slt: {
    format: ["000000", rs, rt, rd, "00000", "101010"],
    display: [rd, rs, rt],
  },
  slti: {
    format: ["001010", rs, rt, int16],
    display: [rt, rs, int16],
  },
  sltiu: {
    format: ["001011", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
  sltu: {
    format: ["000000", rs, rt, rd, "00000", "101011"],
    display: [rd, rs, rt],
  },
  "sqrt.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "000100"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  sra: {
    format: ["000000", "00000", rt, rd, sa, "000011"],
    display: [rd, rt, sa],
  },
  srav: {
    format: ["000000", rs, rt, rd, "00000", "000111"],
    display: [rd, rt, rs],
  },
  srl: {
    format: ["000000", "00000", rt, rd, sa, "000010"],
    display: [rd, rt, sa],
  },
  srlv: {
    format: ["000000", rs, rt, rd, "00000", "000110"],
    display: [rd, rt, rs],
  },
  sub: {
    format: ["000000", rs, rt, rd, "00000", "100010"],
    display: [rd, rs, rt],
  },
  "sub.fmt": {
    format: ["010001", fmt, ft, fs, fd, "000001"],
    fmts: ["S", "D"],
    display: [fd, fs, ft],
  },
  subu: {
    format: ["000000", rs, rt, rd, "00000", "100011"],
    display: [rd, rs, rt],
  },
  sw: {
    format: ["101011", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swc1: {
    format: ["111001", rs, ft, int16],
    display: [ft, int16, "(", rs, ")"],
  },
  swc2: {
    format: ["111010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swc3: {
    format: ["111011", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swl: {
    format: ["101010", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swr: {
    format: ["101110", rs, rt, int16],
    display: [rt, int16, "(", rs, ")"],
  },
  swxc1: {
    format: ["010011", rs, uint5, fs, "00000", "001000"],
    display: [fs, uint5, "(", rs, ")"],
  },
  sync: {
    format: ["000000", "000000000000000", "00000", "001111"],
    display: [],
  },
  syscall: {
    format: ["000000", [uint20, "00000000000000000000"], "001100"],
    display: [],
  },
  teq: {
    format: ["000000", rs, rt, uint10, "110100"],
    display: [rs, rt],
  },
  teqi: {
    format: ["000001", rs, "01100", int16],
    display: [rs, int16],
  },
  tge: {
    format: ["000000", rs, rt, uint10, "110000"],
    display: [rs, rt],
  },
  tgei: {
    format: ["000001", rs, "01000", int16],
    display: [rs, int16],
  },
  tgeiu: {
    format: ["000001", rs, "01001", uint16],
    display: [rs, uint16],
  },
  tgeu: {
    format: ["000000", rs, rt, uint10, "110001"],
    display: [rs, rt],
  },
  tlt: {
    format: ["000000", rs, rt, uint10, "110010"],
    display: [rs, rt],
  },
  tlti: {
    format: ["000001", rs, "01010", int16],
    display: [rs, int16],
  },
  tltiu: {
    format: ["000001", rs, "01011", uint16],
    display: [rs, uint16],
  },
  tltu: {
    format: ["000000", rs, rt, uint10, "110011"],
    display: [rs, rt],
  },
  tne: {
    format: ["000000", rs, rt, uint10, "110110"],
    display: [rs, rt],
  },
  tnei: {
    format: ["000001", rs, "01110", int16],
    display: [rs, int16],
  },
  "trunc.l.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001001"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  "trunc.w.fmt": {
    format: ["010001", fmt, "00000", fs, fd, "001101"],
    fmts: ["S", "D"],
    display: [fd, fs],
  },
  xor: {
    format: ["000000", rs, rt, rd, "00000", "100110"],
    display: [rd, rs, rt],
  },
  xori: {
    format: ["001110", rs, rt, uint16],
    display: [rt, rs, uint16],
  },
};


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__parse__ = __webpack_require__(5);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return __WEBPACK_IMPORTED_MODULE_0__parse__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__print__ = __webpack_require__(7);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "print", function() { return __WEBPACK_IMPORTED_MODULE_1__print__["a"]; });





/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parse;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__opcodes__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__immediates__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__regs__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__regex__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__bitstrings__ = __webpack_require__(2);






/**
 * Parses a string MIPS instruction, returning numeric machine code.
 *
 * With the `intermediate` option, this can also be used as a convenient base
 * for an assembler. The object output with `intermediate` can be manipulated
 * prior to calling `parse` with it again.
 * @param {String|Array|Object} value MIPS instruction, or intermediate object format.
 * @param {Object} opts Behavior options
 * @param {Boolean} opts.intermediate: Output an object intermediate format instead of a number
 * @returns {Number|Array|Object} Returns a numeric representation of the given
 * MIPS instruction string.
 * If multiple values are given (array) then multiple values are returned.
 * When the `intermediate` option is passed, the return type is an object.
 */
function parse(value, opts) {
  opts = _getFinalOpts(opts);

  if (Array.isArray(value)) {
    return value.map(s => _parse(s, opts));
  }
  if (typeof value === "object") {
    return _parse(value, opts);
  }
  if (typeof value === "string") {
    const values = value.split(/\r?\n/).filter(v => !!(v.trim()));
    if (values.length === 1)
      return _parse(values[0], opts);
    else
      return values.map(s => _parse(s, opts));
  }

  throw new Error("Unexpected input to parse. Pass a string or array of strings.");
}

function _getFinalOpts(givenOpts) {
  return Object.assign({
    intermediate: false,
  }, givenOpts);
}

function _parse(value, opts) {
  let opcode, opcodeObj, values;
  if (typeof value === "string") {
    opcode = __WEBPACK_IMPORTED_MODULE_3__regex__["a" /* getOpcode */](value);
    if (!opcode)
      throw new Error(`Could not parse opcode from ${value}`);

    opcodeObj = __WEBPACK_IMPORTED_MODULE_0__opcodes__["b" /* getOpcodeDetails */](opcode);

    values = _parseValues(opcode, opcodeObj, value);
  }
  else if (typeof value === "object") {
    opcode = __WEBPACK_IMPORTED_MODULE_3__regex__["a" /* getOpcode */](value.op);
    if (!opcode)
      throw new Error("Object input to parse did not contain 'op'");

    opcodeObj = __WEBPACK_IMPORTED_MODULE_0__opcodes__["b" /* getOpcodeDetails */](opcode);
    values = value;
  }

  if (!opcodeObj)
    throw new Error(`Opcode ${opcode} was not recognized`);

  if (opts.intermediate)
    return values;

  return bitsFromFormat(opcodeObj.format, values);
}

function _parseValues(opcode, opcodeObj, value) {
  let regex = __WEBPACK_IMPORTED_MODULE_3__regex__["b" /* makeRegexForOpcode */](opcodeObj);
  let match = regex.exec(value);
  if (!match)
    throw `Could not parse instruction: ${value}`;

  let values = {
    op: opcode
  };

  if (opcode.indexOf(".fmt") !== -1 || opcode.indexOf(".cond") !== -1) {
    determineOpcodeValues(match[1], opcode, opcodeObj.fmts, opcodeObj.format, values);
  }

  const display = opcodeObj.display;
  let matchIndex = 2; // 0 is whole match, 1 is opcode - skip both
  for (let i = 0; i < display.length; i++, matchIndex++) {
    const parsedVal = match[matchIndex];
    let displayEntry = display[i];

    const optional = displayEntry.endsWith("?");
    displayEntry = displayEntry.replace("?", "");

    switch (displayEntry) {
      case "(":
      case ")":
        matchIndex--; // Eh
        continue;

      case "rs":
      case "rd":
      case "rt": {
        const tryReg = __WEBPACK_IMPORTED_MODULE_2__regs__["h" /* getRegBits */](parsedVal);
        if (tryReg === undefined) {
          if (optional)
            continue;

          throw new Error(`Unrecognized ${displayEntry} register ${parsedVal}`);
        }
        values[displayEntry] = tryReg;
        continue;
      }

      case "fs":
      case "ft":
      case "fd":
      case "fr":
        values[displayEntry] = parseInt(parsedVal);
        if (isNaN(values[displayEntry]))
          throw new Error(`Unrecognized ${displayEntry} register ${parsedVal}`);
        continue;
    }

    const immDetails = __WEBPACK_IMPORTED_MODULE_1__immediates__["a" /* getImmFormatDetails */](displayEntry);
    if (immDetails) {
      let value;
      const immPieces = [match[matchIndex], match[matchIndex + 1], match[matchIndex + 2]];

      if (!optional || immPieces[2]) {
        value = __WEBPACK_IMPORTED_MODULE_1__immediates__["c" /* parseImmediate */](immPieces, immDetails.bits, immDetails.signed, immDetails.shift);
        values[displayEntry] = value;
      }

      matchIndex += 2;

      continue;
    }

    throw `Unrecognized opcode display entry ${displayEntry}`;
  }

  return values;
}

function bitsFromFormat(format, values) {
  let output = 0;
  let bitOffset = 0;
  for (let i = 0; i < format.length; i++) {
    let writeResult;
    let piece = format[i];
    let bitLength = __WEBPACK_IMPORTED_MODULE_0__opcodes__["c" /* getValueBitLength */](Array.isArray(piece) ? piece[0] : piece);
    output = (output << bitLength) >>> 0;
    if (Array.isArray(piece)) {
      for (let j = 0; j < piece.length; j++) {
        writeResult = writeBitsForPiece(piece[j], output, values);
        if (writeResult.wrote) {
          output = writeResult.output;
          break; // j
        }
      }
    }
    else {
      writeResult = writeBitsForPiece(piece, output, values);
      if (writeResult.wrote) {
        output = writeResult.output;
      }
    }

    bitOffset += bitLength;
  }

  if (bitOffset != 32)
    throw new Error("Incorrect number of bits written for format " + format);

  return output;
}

function writeBitsForPiece(piece, output, values) {
  let wrote = false;
  if (__WEBPACK_IMPORTED_MODULE_4__bitstrings__["b" /* isBinaryLiteral */](piece)) {
    output |= __WEBPACK_IMPORTED_MODULE_4__bitstrings__["d" /* makeBitMaskFromString */](piece);
    wrote = true;
  }
  else if (values[piece] !== undefined) {
    let value = values[piece] & __WEBPACK_IMPORTED_MODULE_4__bitstrings__["c" /* makeBitMask */](__WEBPACK_IMPORTED_MODULE_0__opcodes__["c" /* getValueBitLength */](piece));
    wrote = true;
    output |= value;
  }

  return {
    wrote: wrote,
    output: output >>> 0,
  };
}

function determineOpcodeValues(givenOpcode, genericOpcode, allowedFormats, format, values) {
  const givenPieces = givenOpcode.split(".");
  const genericPieces = genericOpcode.split(".");
  if (givenPieces.length !== genericPieces.length)
    throw `Given opcode ${givenOpcode} does not have all pieces (${genericOpcode})`;

  for (let i = 0; i < genericPieces.length; i++) {
    const genericPiece = genericPieces[i];

    if (genericPiece === "fmt" || genericPiece === "ftm3") {
      if (allowedFormats.indexOf(givenPieces[i]) === -1)
        throw `Format ${givenPieces[i]} is not allowed for ${genericPiece}. Allowed values are ${allowedFormats}`;

      if (genericPiece === "fmt")
        values["fmt"] = __WEBPACK_IMPORTED_MODULE_2__regs__["f" /* getFmtBits */](givenPieces[i]);
      else if (genericPiece === "fmt3")
        values["fmt3"] = __WEBPACK_IMPORTED_MODULE_2__regs__["d" /* getFmt3Bits */](givenPieces[i]);
    }

    if (genericPiece === "cond")
      values["cond"] = __WEBPACK_IMPORTED_MODULE_2__regs__["a" /* getCondBits */](givenPieces[i]);
  }
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getOpcode;
/* harmony export (immutable) */ __webpack_exports__["b"] = makeRegexForOpcode;
/* unused harmony export isReg */
/* unused harmony export isFloatReg */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__regs__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__immediates__ = __webpack_require__(1);



const opRegex = "([A-Za-z0-3.]+)";
const immRegex = "(-)?0?([xbo]?)([A-Fa-f0-9]+)";
const regRegex = "\\$?(\\w+)";
const floatRegRegex = "\\$?[Ff]([0-9]+)";

const opcodeRegex = new RegExp("^\\s*" + opRegex);

// Gets the op string from a given entire instruction.
// This is a general form (.fmt rather than .S, .D, etc.)
function getOpcode(str) {
  const match = opcodeRegex.exec(str);
  if (match) {
    const pieces = match[1].split("."); // Could be .fmt, .cond.fmt, etc
    if (pieces.length === 1)
      return pieces[0].toLowerCase();

    // Loop from the end, as the end has the .fmt for tricky things like .D.W
    let result = "";
    let foundFmt = false;
    let foundCond = false;
    for (let i = pieces.length - 1; i > 0; i--) {
      let piece = pieces[i];
      if (!foundFmt) {
        if (piece === "fmt" || __WEBPACK_IMPORTED_MODULE_0__regs__["k" /* isFmtString */](piece)) {
          foundFmt = true;
          piece = "fmt";
        }
      }

      if (!foundCond) {
        if (__WEBPACK_IMPORTED_MODULE_0__regs__["j" /* isCondString */](piece)) {
          foundCond = true;
          piece = "cond";
        }
      }

      result = "." + piece + result;
    }

    return (pieces[0] + result).toLowerCase();
  }
  return null;
}

function makeRegexForOpcode(opcodeObj) {
  const display = opcodeObj.display;

  const parts = [opRegex];

  for (let i = 0; i < display.length; i++) {
    const part = display[i];
    const optional = part.endsWith("?");

    let regexPart = "";
    if (optional)
      regexPart += "(?:";

    if (display[i + 1] === "(") {
      if (optional)
        throw new Error("Not prepared to generate optional regex with parenthesis");

      if (display[i + 3] !== ")")
        throw new Error("Not prepared to generate regex for multiple values in parenthesis"); // Or no closing paren

      regexPart += makeParenthesisRegex(getRegexForPart(part), getRegexForPart(display[i + 2]));
      i = i + 3;
    }
    else {
      regexPart += getRegexForPart(part);
    }

    if (optional)
      regexPart += "[,\\s]+)?";

    parts.push(regexPart);
  }

  let regexStr =
    "^\\s*" +
    parts.reduce((str, next, index) => {
      if (index === parts.length - 1)
        return str + next;

      // If it is an optional group, we already included the whitespace trailing.
      if (!next.startsWith("(?:"))
        return str + next + "[,\\s]+";

      return str + next;
    }, "") +
    "\\s*$";

  return new RegExp(regexStr);
}

function getRegexForPart(part) {
  if (isReg(part))
    return regRegex;
  if (isFloatReg(part))
    return floatRegRegex;

  if (__WEBPACK_IMPORTED_MODULE_1__immediates__["a" /* getImmFormatDetails */](part))
    return immRegex;

  throw new Error(`Unrecognized display entry ${part}`);
}

function makeParenthesisRegex(regex1, regex2) {
  return regex1 + "\\s*" + "\\(?" + regex2 + "\\)?";
}

function isReg(entry) {
  if (!entry)
    return false;

  switch (entry.substr(0, 2)) {
    case "rs":
    case "rt":
    case "rd":
      return true;
  }
  return false;
}

function isFloatReg(entry) {
  if (!entry)
    return false;

  switch (entry.substr(0, 2)) {
    case "fs":
    case "ft":
    case "fd":
      return true;
  }
  return false;
}


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = print;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__opcodes__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__regs__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__immediates__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__bitstrings__ = __webpack_require__(2);





/**
 * Prints a string representation of a MIPS instruction.
 *
 * With the `intermediate` option, this can also be used as a convenient base
 * for a disassembler. The object output with `intermediate` can be manipulated
 * prior to calling `print` with it again.
 * @param {Number|Array|ArrayBuffer|DataView|Object} inst MIPS instruction, or intermediate object format.
 * @param {Object} opts Behavior options
 * @param {String} opts.casing "toUpperCase" (default), "toLowerCase"
 * @param {Boolean} opts.commas True to separate values by commas
 * @param {Boolean} opts.include$ True to prefix registers with dollar sign
 * @param {Boolean} opts.intermediate: Output an object intermediate format instead of a string
 * @param {Number} opts.numBase Number format. 16 (hex, default), 10 (decimal)
 * @returns {String|Array|Object} Returns a string representation of the given
 * MIPS instruction code(s).
 * If multiple values are given (array) then multiple values are returned.
 * When the `intermediate` option is passed, the return type is an object.
 */
function print(inst, opts) {
  opts = _getFinalOpts(opts);

  if (Array.isArray(inst))
    return inst.map(i => _print(i, opts));

  const isArrayBuffer = inst instanceof ArrayBuffer;
  if (isArrayBuffer || inst instanceof DataView) {
    const dataView = isArrayBuffer ? new DataView(inst) : inst;
    const result = [];
    for (let i = 0; i < dataView.byteLength; i += 4) {
      result.push(_print(dataView.getUint32(i), opts));
    }
    return result;
  }

  const inputType = typeof inst;
  if (inputType === "number" || inputType === "object")
    return _print(inst, opts);

  throw new Error("Unexpected input to print.");
}

function _getFinalOpts(givenOpts) {
  return Object.assign({
    casing: "toUpperCase",
    commas: false,
    include$: false,
    intermediate: false,
    numBase: 16
  }, givenOpts);
}

function _print(inst, opts) {
  let opcodeObj, opName, values;
  if (typeof inst === "number") {
    opName = __WEBPACK_IMPORTED_MODULE_0__opcodes__["a" /* findMatch */](inst);
    if (!opName)
      throw new Error("Unrecognized instruction");

    opcodeObj = __WEBPACK_IMPORTED_MODULE_0__opcodes__["b" /* getOpcodeDetails */](opName);

    values = _extractValues(inst, opcodeObj.format);
    values.op = opName;
  }
  else if (typeof inst === "object") {
    if (!inst.op)
      throw new Error("Instruction object did not contain op");

    opcodeObj = __WEBPACK_IMPORTED_MODULE_0__opcodes__["b" /* getOpcodeDetails */](inst.op);

    values = inst;
  }
  else
    throw new Error(`Unexpected value ${inst}`);

  if (!opcodeObj)
    throw new Error("Invalid opcode");

  if (opts.intermediate)
    return values;

  return _printValues(values, opcodeObj, opts);
}

function _printValues(values, opcodeObj, opts) {
  let result = _formatOpcode(values, opts);

  function _getRegName(displayEntry) {
    switch (displayEntry) {
      case "rs":
      case "rt":
      case "rd":
        return __WEBPACK_IMPORTED_MODULE_1__regs__["i" /* getRegName */](values[displayEntry]);

      case "fs":
      case "ft":
      case "fd":
        return __WEBPACK_IMPORTED_MODULE_1__regs__["c" /* getFloatRegName */](values[displayEntry]);
    }
  }

  const display = opcodeObj.display;
  for (let i = 0; i < display.length; i++) {
    let displayEntry = display[i];

    if (displayEntry.endsWith("?")) {
      displayEntry = displayEntry.replace("?", "");
      if (values[displayEntry] === undefined)
        continue; // Optional value, not set.
    }

    let value = values[displayEntry];
    if (value === undefined && displayEntry !== "(" && displayEntry !== ")") {
      throw new Error(`Expected ${displayEntry} value, got undefined`);
    }

    let addComma = opts.commas;

    switch (displayEntry) {
      case "rs":
      case "rt":
      case "rd":
      case "fs":
      case "ft":
      case "fd":
        if (!result.endsWith("("))
          result += " ";
        result += _formatReg(_getRegName(displayEntry), opts);
        break;

      case "(":
      case ")":
        addComma = false;
        if (result.endsWith(","))
          result = result.slice(0, -1); // Lop off comma, since we are involved in a parenthesis open/close

        result += displayEntry;
        break;
    }

    const immDetails = __WEBPACK_IMPORTED_MODULE_2__immediates__["a" /* getImmFormatDetails */](displayEntry);
    if (immDetails) {
      if (!result.endsWith("("))
        result += " ";

      if (immDetails.signed && immDetails.bits === 16) {
        value = __WEBPACK_IMPORTED_MODULE_2__immediates__["b" /* makeInt16 */](value);
      }
      if (immDetails.shift) {
        value = value << immDetails.shift;
      }

      result += _formatNumber(value, opts);
    }

    if (addComma && (i !== display.length - 1) && !result.endsWith(",")) {
      result += ",";
    }
  }

  return result.trim();
}

function _extractValues(inst, format) {
  let values = {};
  for (let i = format.length - 1; i >= 0; i--) {
    let value, bitLength;
    let piece = format[i];
    if (Array.isArray(piece)) {
      for (let j = piece.length - 1; j >= 0; j--) {
        bitLength = __WEBPACK_IMPORTED_MODULE_0__opcodes__["c" /* getValueBitLength */](piece[j]);
        value = inst & __WEBPACK_IMPORTED_MODULE_3__bitstrings__["c" /* makeBitMask */](bitLength);

        if (__WEBPACK_IMPORTED_MODULE_3__bitstrings__["b" /* isBinaryLiteral */](piece[j])) {
          if (piece[j] === __WEBPACK_IMPORTED_MODULE_3__bitstrings__["e" /* padBitString */](value.toString(2), bitLength)) {
            piece = piece[j];
            break;
          }
        }
        else {
          piece = piece[j];
          break;
        }
      }
    }
    else {
      bitLength = __WEBPACK_IMPORTED_MODULE_0__opcodes__["c" /* getValueBitLength */](piece);
      value = inst & __WEBPACK_IMPORTED_MODULE_3__bitstrings__["c" /* makeBitMask */](bitLength);
    }

    if (__WEBPACK_IMPORTED_MODULE_3__bitstrings__["b" /* isBinaryLiteral */](piece)) {
      inst >>>= bitLength;
      continue;
    }

    values[piece] = value;

    inst >>>= bitLength;
  }

  return values;
}

function _formatNumber(num, opts) {
  if (num === 0)
    return num.toString(opts.numBase);

  let value = "";
  if (num < 0)
    value += "-";

  if (opts.numBase === 16)
    value += "0x";
  else if (opts.numBase === 8)
    value += "0o";
  else if (opts.numBase === 2)
    value += "0b";

  value += _applyCasing(Math.abs(num).toString(opts.numBase), opts.casing);
  return value;
}

function _formatReg(regStr, opts) {
  let value = "";
  if (opts.include$)
    value += "$";
  value += _applyCasing(regStr, opts.casing);
  return value;
}

function _formatOpcode(values, opts) {
  const pieces = values.op.split(".");
  for (let i = 0; i < pieces.length; i++) {
    if (pieces[i] === "fmt") {
      if (values.hasOwnProperty("fmt3"))
        pieces[i] = __WEBPACK_IMPORTED_MODULE_1__regs__["e" /* getFmt3Name */](values["fmt3"]);
      else if (values.hasOwnProperty("fmt"))
        pieces[i] = __WEBPACK_IMPORTED_MODULE_1__regs__["g" /* getFmtName */](values["fmt"]);
      else
        throw new Error("Format value not available");
    }
    else if (pieces[i] === "cond") {
      if (values.hasOwnProperty("cond"))
        pieces[i] = __WEBPACK_IMPORTED_MODULE_1__regs__["b" /* getCondName */](values["cond"]);
      else
        throw new Error("Condition value not available");
    }
  }
  let opcode = pieces.join(".");

  return _applyCasing(opcode, opts.casing);
}

function _applyCasing(value, casing) {
  switch (casing) {
    case "toLowerCase":
      return value.toLowerCase();

    case "toUpperCase":
    default:
      return value.toUpperCase();
  }
}


/***/ })
/******/ ]);
});

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = handleDirective;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__directives_definelabel__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__directives_org__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__directives_orga__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__directives_align__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__directives_skip__ = __webpack_require__(10);





function getDirectives() {
    return [
        __WEBPACK_IMPORTED_MODULE_0__directives_definelabel__["a" /* default */],
        __WEBPACK_IMPORTED_MODULE_1__directives_org__["a" /* default */],
        __WEBPACK_IMPORTED_MODULE_2__directives_orga__["a" /* default */],
        __WEBPACK_IMPORTED_MODULE_3__directives_align__["a" /* default */],
        __WEBPACK_IMPORTED_MODULE_4__directives_skip__["a" /* default */],
    ];
}
/**
 * Runs a directive, which changes the assembler state.
 * @param state Current assembler state.
 */
function handleDirective(state) {
    if (getDirectives().some(function (directive) { return directive(state); }))
        return;
    throw new Error("handleDirective: Unrecongized directive " + state.line);
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = definelabel;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__immediates__ = __webpack_require__(0);

var defineLabelRegex = /^\.definelabel\s+(\w+)[\s,]+(\w+)$/i;
/**
 * .definelabel adds a new symbol.
 * @param state Current assembler state.
 */
function definelabel(state) {
    var results = state.line.match(defineLabelRegex);
    if (results === null)
        return false; // Not .definelabel
    var name = results[1], value = results[2];
    var imm = Object(__WEBPACK_IMPORTED_MODULE_0__immediates__["a" /* parseImmediate */])(value);
    if (imm === null) {
        if (!state.symbols[value])
            throw new Error(".definelabel value must be numeric or an alias to another label");
        state.symbols[name] = state.symbols[value]; // Alias
    }
    else {
        state.symbols[name] = imm;
    }
    return true; // Symbol added
}


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = orga;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__immediates__ = __webpack_require__(0);

var orgRegex = /^\.org\s+(\w+)$/i;
/**
 * .org changes the effective memory position.
 * @param state Current assembler state.
 */
function orga(state) {
    var results = state.line.match(orgRegex);
    if (results === null)
        return false; // Not .org
    var loc = results[1];
    var imm = Object(__WEBPACK_IMPORTED_MODULE_0__immediates__["a" /* parseImmediate */])(loc);
    if (imm === null)
        throw new Error("Could not parse .org immediate " + loc);
    state.memPos = imm >>> 0; // Better be 32-bit
    return true;
}


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = orga;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__immediates__ = __webpack_require__(0);

var orgaRegex = /^\.orga\s+(\w+)$/i;
/**
 * .orga updates the current output buffer index.
 * @param state Current assembler state.
 */
function orga(state) {
    var results = state.line.match(orgaRegex);
    if (results === null)
        return false; // Not .orga
    var loc = results[1];
    var imm = Object(__WEBPACK_IMPORTED_MODULE_0__immediates__["a" /* parseImmediate */])(loc);
    if (imm === null)
        throw new Error("Could not parse .orga immediate " + loc);
    state.outIndex = imm >>> 0; // Better be 32-bit
    return true;
}


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = align;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__types__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__immediates__ = __webpack_require__(0);


var alignRegex = /^\.align\s+(\w+)$/i;
/**
 * .align pads zeroes until the output position is aligned
 * with the specified alignment.
 * @param state Current assembler state.
 */
function align(state) {
    var results = state.line.match(alignRegex);
    if (results === null)
        return false; // Not .align
    var immString = results[1];
    var imm = Object(__WEBPACK_IMPORTED_MODULE_1__immediates__["a" /* parseImmediate */])(immString);
    if (imm === null)
        throw new Error("Could not parse .align immediate " + immString);
    while (state.outIndex % imm) {
        if (state.currentPass === __WEBPACK_IMPORTED_MODULE_0__types__["a" /* AssemblerPhase */].secondPass) {
            state.dataView.setUint8(state.outIndex, 0);
        }
        state.outIndex++;
    }
    return true;
}


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = skip;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__immediates__ = __webpack_require__(0);

var regex = /^\.skip\s+(\w+)$/i;
/**
 * .skip passes over a given amout of bytes without overwriting them.
 * @param state Current assembler state.
 */
function skip(state) {
    var results = state.line.match(regex);
    if (results === null)
        return false;
    var immString = results[1];
    var imm = Object(__WEBPACK_IMPORTED_MODULE_0__immediates__["a" /* parseImmediate */])(immString);
    if (imm === null)
        throw new Error("Could not parse .skip immediate " + immString);
    if (imm < 0)
        throw new Error(".skip directive cannot skip a negative length.");
    state.outIndex += imm;
    return true;
}


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = runFunction;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__immediates__ = __webpack_require__(0);

/** Runs any built-in functions, and also resolves symbols. */
function runFunction(value, state) {
    // Don't parse an immediate on the root call.
    var result = _runFunction(value, state, false);
    if (result !== null)
        return "0x" + result.toString(16).toUpperCase();
    return null;
}
function _runFunction(value, state, doParseImmediate) {
    var fnRegex = /^(\w+)\(([\(\),\w+]+)\)$/;
    var results = fnRegex.exec(value);
    if (results === null) { // Not a function
        var imm = null;
        if (doParseImmediate && (imm = Object(__WEBPACK_IMPORTED_MODULE_0__immediates__["a" /* parseImmediate */])(value)) !== null) {
            return imm;
        }
        if (state.symbols[value] !== undefined) {
            return state.symbols[value];
        }
        return null;
    }
    else {
        var fn = results[1], args = results[2];
        if (!fns[fn]) {
            // Did a symbol label accidentally look like a function?
            if (state.symbols[fn] !== undefined)
                return state.symbols[fn];
            return null; // Might have been something like 0x10(V0)
        }
        // TODO: Doesn't support nested calls, multiple arguments.
        return fns[fn].call(fns[fn], _runFunction(args, state, true));
    }
}
var fns = {
    hi: function (value) {
        var lower = value & 0x0000FFFF;
        var upper = value >>> 16;
        if (lower & 0x8000)
            upper += 1;
        return upper;
    },
    lo: function (value) {
        return value & 0x0000FFFF;
    },
};


/***/ })
/******/ ]);
});