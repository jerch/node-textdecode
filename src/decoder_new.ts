// stripped from https://github.com/BobSteagall/utf_utils

const enum CharClass {
    ILL = 0,    //- C0..C1, F5..FF  ILLEGAL octets that should never appear in a UTF-8 sequence
                //
    ASC = 1,    //- 00..7F          ASCII leading byte range
                //
    CR1 = 2,    //- 80..8F          Continuation range 1
    CR2 = 3,    //- 90..9F          Continuation range 2
    CR3 = 4,    //- A0..BF          Continuation range 3
                //
    L2A = 5,    //- C2..DF          Leading byte range A / 2-byte sequence
                //
    L3A = 6,    //- E0              Leading byte range A / 3-byte sequence
    L3B = 7,    //- E1..EC, EE..EF  Leading byte range B / 3-byte sequence
    L3C = 8,    //- ED              Leading byte range C / 3-byte sequence
                //
    L4A = 9,    //- F0              Leading byte range A / 4-byte sequence
    L4B = 10,   //- F1..F3          Leading byte range B / 4-byte sequence
    L4C = 11,   //- F4              Leading byte range C / 4-byte sequence
};

const enum State
{
    BGN = 0,    //- Start
    ERR = 12,   //- Invalid sequence
                //
    CS1 = 24,   //- Continuation state 1
    CS2 = 36,   //- Continuation state 2
    CS3 = 48,   //- Continuation state 3
                //
    P3A = 60,   //- Partial 3-byte sequence state A
    P3B = 72,   //- Partial 3-byte sequence state B
                //
    P4A = 84,   //- Partial 4-byte sequence state A
    P4B = 96,   //- Partial 4-byte sequence state B
                //
    END = BGN,  //- Start and End are the same state!
    err = ERR,  //- For readability in the state transition table
};

const maFirstUnitTable = new Uint8Array([
  0x00, State.BGN,   //- 0x00
  0x01, State.BGN,   //- 0x01
  0x02, State.BGN,   //- 0x02
  0x03, State.BGN,   //- 0x03
  0x04, State.BGN,   //- 0x04
  0x05, State.BGN,   //- 0x05
  0x06, State.BGN,   //- 0x06
  0x07, State.BGN,   //- 0x07
  0x08, State.BGN,   //- 0x08
  0x09, State.BGN,   //- 0x09
  0x0A, State.BGN,   //- 0x0A
  0x0B, State.BGN,   //- 0x0B
  0x0C, State.BGN,   //- 0x0C
  0x0D, State.BGN,   //- 0x0D
  0x0E, State.BGN,   //- 0x0E
  0x0F, State.BGN,   //- 0x0F

  0x10, State.BGN,   //- 0x10
  0x11, State.BGN,   //- 0x11
  0x12, State.BGN,   //- 0x12
  0x13, State.BGN,   //- 0x13
  0x14, State.BGN,   //- 0x14
  0x15, State.BGN,   //- 0x15
  0x16, State.BGN,   //- 0x16
  0x17, State.BGN,   //- 0x17
  0x18, State.BGN,   //- 0x18
  0x19, State.BGN,   //- 0x19
  0x1A, State.BGN,   //- 0x1A
  0x1B, State.BGN,   //- 0x1B
  0x1C, State.BGN,   //- 0x1C
  0x1D, State.BGN,   //- 0x1D
  0x1E, State.BGN,   //- 0x1E
  0x1F, State.BGN,   //- 0x1F

  0x20, State.BGN,   //- 0x20
  0x21, State.BGN,   //- 0x21
  0x22, State.BGN,   //- 0x22
  0x23, State.BGN,   //- 0x23
  0x24, State.BGN,   //- 0x24
  0x25, State.BGN,   //- 0x25
  0x26, State.BGN,   //- 0x26
  0x27, State.BGN,   //- 0x27
  0x28, State.BGN,   //- 0x28
  0x29, State.BGN,   //- 0x29
  0x2A, State.BGN,   //- 0x2A
  0x2B, State.BGN,   //- 0x2B
  0x2C, State.BGN,   //- 0x2C
  0x2D, State.BGN,   //- 0x2D
  0x2E, State.BGN,   //- 0x2E
  0x2F, State.BGN,   //- 0x2F

  0x30, State.BGN,   //- 0x30
  0x31, State.BGN,   //- 0x31
  0x32, State.BGN,   //- 0x32
  0x33, State.BGN,   //- 0x33
  0x34, State.BGN,   //- 0x34
  0x35, State.BGN,   //- 0x35
  0x36, State.BGN,   //- 0x36
  0x37, State.BGN,   //- 0x37
  0x38, State.BGN,   //- 0x38
  0x39, State.BGN,   //- 0x39
  0x3A, State.BGN,   //- 0x3A
  0x3B, State.BGN,   //- 0x3B
  0x3C, State.BGN,   //- 0x3C
  0x3D, State.BGN,   //- 0x3D
  0x3E, State.BGN,   //- 0x3E
  0x3F, State.BGN,   //- 0x3F

  0x40, State.BGN,   //- 0x40
  0x41, State.BGN,   //- 0x41
  0x42, State.BGN,   //- 0x42
  0x43, State.BGN,   //- 0x43
  0x44, State.BGN,   //- 0x44
  0x45, State.BGN,   //- 0x45
  0x46, State.BGN,   //- 0x46
  0x47, State.BGN,   //- 0x47
  0x48, State.BGN,   //- 0x48
  0x49, State.BGN,   //- 0x49
  0x4A, State.BGN,   //- 0x4A
  0x4B, State.BGN,   //- 0x4B
  0x4C, State.BGN,   //- 0x4C
  0x4D, State.BGN,   //- 0x4D
  0x4E, State.BGN,   //- 0x4E
  0x4F, State.BGN,   //- 0x4F

  0x50, State.BGN,   //- 0x50
  0x51, State.BGN,   //- 0x51
  0x52, State.BGN,   //- 0x52
  0x53, State.BGN,   //- 0x53
  0x54, State.BGN,   //- 0x54
  0x55, State.BGN,   //- 0x55
  0x56, State.BGN,   //- 0x56
  0x57, State.BGN,   //- 0x57
  0x58, State.BGN,   //- 0x58
  0x59, State.BGN,   //- 0x59
  0x5A, State.BGN,   //- 0x5A
  0x5B, State.BGN,   //- 0x5B
  0x5C, State.BGN,   //- 0x5C
  0x5D, State.BGN,   //- 0x5D
  0x5E, State.BGN,   //- 0x5E
  0x5F, State.BGN,   //- 0x5F

  0x60, State.BGN,   //- 0x60
  0x61, State.BGN,   //- 0x61
  0x62, State.BGN,   //- 0x62
  0x63, State.BGN,   //- 0x63
  0x64, State.BGN,   //- 0x64
  0x65, State.BGN,   //- 0x65
  0x66, State.BGN,   //- 0x66
  0x67, State.BGN,   //- 0x67
  0x68, State.BGN,   //- 0x68
  0x69, State.BGN,   //- 0x69
  0x6A, State.BGN,   //- 0x6A
  0x6B, State.BGN,   //- 0x6B
  0x6C, State.BGN,   //- 0x6C
  0x6D, State.BGN,   //- 0x6D
  0x6E, State.BGN,   //- 0x6E
  0x6F, State.BGN,   //- 0x6F

  0x70, State.BGN,   //- 0x70
  0x71, State.BGN,   //- 0x71
  0x72, State.BGN,   //- 0x72
  0x73, State.BGN,   //- 0x73
  0x74, State.BGN,   //- 0x74
  0x75, State.BGN,   //- 0x75
  0x76, State.BGN,   //- 0x76
  0x77, State.BGN,   //- 0x77
  0x78, State.BGN,   //- 0x78
  0x79, State.BGN,   //- 0x79
  0x7A, State.BGN,   //- 0x7A
  0x7B, State.BGN,   //- 0x7B
  0x7C, State.BGN,   //- 0x7C
  0x7D, State.BGN,   //- 0x7D
  0x7E, State.BGN,   //- 0x7E
  0x7F, State.BGN,   //- 0x7F

  0x00, State.ERR,   //- 0x80
  0x01, State.ERR,   //- 0x81
  0x02, State.ERR,   //- 0x82
  0x03, State.ERR,   //- 0x83
  0x04, State.ERR,   //- 0x84
  0x05, State.ERR,   //- 0x85
  0x06, State.ERR,   //- 0x86
  0x07, State.ERR,   //- 0x87
  0x08, State.ERR,   //- 0x88
  0x09, State.ERR,   //- 0x89
  0x0A, State.ERR,   //- 0x8A
  0x0B, State.ERR,   //- 0x8B
  0x0C, State.ERR,   //- 0x8C
  0x0D, State.ERR,   //- 0x8D
  0x0E, State.ERR,   //- 0x8E
  0x0F, State.ERR,   //- 0x8F

  0x10, State.ERR,   //- 0x90
  0x11, State.ERR,   //- 0x91
  0x12, State.ERR,   //- 0x92
  0x13, State.ERR,   //- 0x93
  0x14, State.ERR,   //- 0x94
  0x15, State.ERR,   //- 0x95
  0x16, State.ERR,   //- 0x96
  0x17, State.ERR,   //- 0x97
  0x18, State.ERR,   //- 0x98
  0x19, State.ERR,   //- 0x99
  0x1A, State.ERR,   //- 0x9A
  0x1B, State.ERR,   //- 0x9B
  0x1C, State.ERR,   //- 0x9C
  0x1D, State.ERR,   //- 0x9D
  0x1E, State.ERR,   //- 0x9E
  0x1F, State.ERR,   //- 0x9F

  0x20, State.ERR,   //- 0xA0
  0x21, State.ERR,   //- 0xA1
  0x22, State.ERR,   //- 0xA2
  0x23, State.ERR,   //- 0xA3
  0x24, State.ERR,   //- 0xA4
  0x25, State.ERR,   //- 0xA5
  0x26, State.ERR,   //- 0xA6
  0x27, State.ERR,   //- 0xA7
  0x28, State.ERR,   //- 0xA8
  0x29, State.ERR,   //- 0xA9
  0x2A, State.ERR,   //- 0xAA
  0x2B, State.ERR,   //- 0xAB
  0x2C, State.ERR,   //- 0xAC
  0x2D, State.ERR,   //- 0xAD
  0x2E, State.ERR,   //- 0xAE
  0x2F, State.ERR,   //- 0xAF

  0x30, State.ERR,   //- 0xB0
  0x31, State.ERR,   //- 0xB1
  0x32, State.ERR,   //- 0xB2
  0x33, State.ERR,   //- 0xB3
  0x34, State.ERR,   //- 0xB4
  0x35, State.ERR,   //- 0xB5
  0x36, State.ERR,   //- 0xB6
  0x37, State.ERR,   //- 0xB7
  0x38, State.ERR,   //- 0xB8
  0x39, State.ERR,   //- 0xB9
  0x3A, State.ERR,   //- 0xBA
  0x3B, State.ERR,   //- 0xBB
  0x3C, State.ERR,   //- 0xBC
  0x3D, State.ERR,   //- 0xBD
  0x3E, State.ERR,   //- 0xBE
  0x3F, State.ERR,   //- 0xBF

  0xC0, State.ERR,   //- 0xC0
  0xC1, State.ERR,   //- 0xC1
  0x02, State.CS1,   //- 0xC2
  0x03, State.CS1,   //- 0xC3
  0x04, State.CS1,   //- 0xC4
  0x05, State.CS1,   //- 0xC5
  0x06, State.CS1,   //- 0xC6
  0x07, State.CS1,   //- 0xC7
  0x08, State.CS1,   //- 0xC8
  0x09, State.CS1,   //- 0xC9
  0x0A, State.CS1,   //- 0xCA
  0x0B, State.CS1,   //- 0xCB
  0x0C, State.CS1,   //- 0xCC
  0x0D, State.CS1,   //- 0xCD
  0x0E, State.CS1,   //- 0xCE
  0x0F, State.CS1,   //- 0xCF

  0x10, State.CS1,   //- 0xD0
  0x11, State.CS1,   //- 0xD1
  0x12, State.CS1,   //- 0xD2
  0x13, State.CS1,   //- 0xD3
  0x14, State.CS1,   //- 0xD4
  0x15, State.CS1,   //- 0xD5
  0x16, State.CS1,   //- 0xD6
  0x17, State.CS1,   //- 0xD7
  0x18, State.CS1,   //- 0xD8
  0x19, State.CS1,   //- 0xD9
  0x1A, State.CS1,   //- 0xDA
  0x1B, State.CS1,   //- 0xDB
  0x1C, State.CS1,   //- 0xDC
  0x1D, State.CS1,   //- 0xDD
  0x1E, State.CS1,   //- 0xDE
  0x1F, State.CS1,   //- 0xDF

  0x00, State.P3A,   //- 0xE0
  0x01, State.CS2,   //- 0xE1
  0x02, State.CS2,   //- 0xE2
  0x03, State.CS2,   //- 0xE3
  0x04, State.CS2,   //- 0xE4
  0x05, State.CS2,   //- 0xE5
  0x06, State.CS2,   //- 0xE6
  0x07, State.CS2,   //- 0xE7
  0x08, State.CS2,   //- 0xE8
  0x09, State.CS2,   //- 0xE9
  0x0A, State.CS2,   //- 0xEA
  0x0B, State.CS2,   //- 0xEB
  0x0C, State.CS2,   //- 0xEC
  0x0D, State.P3B,   //- 0xED
  0x0E, State.CS2,   //- 0xEE
  0x0F, State.CS2,   //- 0xEF

  0x00, State.P4A,   //- 0xF0
  0x01, State.CS3,   //- 0xF1
  0x02, State.CS3,   //- 0xF2
  0x03, State.CS3,   //- 0xF3
  0x04, State.P4B,   //- 0xF4
  0xF5, State.ERR,   //- 0xF5
  0xF6, State.ERR,   //- 0xF6
  0xF7, State.ERR,   //- 0xF7
  0xF8, State.ERR,   //- 0xF8
  0xF9, State.ERR,   //- 0xF9
  0xFA, State.ERR,   //- 0xFA
  0xFB, State.ERR,   //- 0xFB
  0xFC, State.ERR,   //- 0xFC
  0xFD, State.ERR,   //- 0xFD
  0xFE, State.ERR,   //- 0xFE
  0xFF, State.ERR,   //- 0xFF
]);

const maOctetCategory = new Uint8Array([
  CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, //- 00..0F
  CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, //- 10..1F
  CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, //- 20..2F
  CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, //- 30..3F
                                                                                  //
  CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, //- 40..4F
  CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, //- 50..5F
  CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, //- 60..6F
  CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, CharClass.ASC, //- 70..7F
                                                                                  //
  CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, CharClass.CR1, //- 80..8F
  CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, CharClass.CR2, //- 90..9F
  CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, //- A0..AF
  CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, CharClass.CR3, //- B0..BF
                                                                                  //
  CharClass.ILL, CharClass.ILL, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, //- C0..CF
  CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, CharClass.L2A, //- D0..DF
  CharClass.L3A, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3B, CharClass.L3C, CharClass.L3B, CharClass.L3B, //- E0..EF
  CharClass.L4A, CharClass.L4B, CharClass.L4B, CharClass.L4B, CharClass.L4C, CharClass.ILL, CharClass.ILL, CharClass.ILL, CharClass.ILL, CharClass.ILL, CharClass.ILL, CharClass.ILL, CharClass.ILL, CharClass.ILL, CharClass.ILL, CharClass.ILL, //- F0..FF
]);

const maTransitions = new Uint8Array([
  State.err, State.END, State.err, State.err, State.err, State.CS1, State.P3A, State.CS2, State.P3B, State.P4A, State.CS3, State.P4B,	  //- BGN|END
  State.err, State.err, State.err, State.err, State.err, State.err, State.err, State.err, State.err, State.err, State.err, State.err,   //- ERR
                              //
  State.err, State.err, State.END, State.END, State.END, State.err, State.err, State.err, State.err, State.err, State.err, State.err,   //- CS1
  State.err, State.err, State.CS1, State.CS1, State.CS1, State.err, State.err, State.err, State.err, State.err, State.err, State.err,   //- CS2
  State.err, State.err, State.CS2, State.CS2, State.CS2, State.err, State.err, State.err, State.err, State.err, State.err, State.err,   //- CS3
                              //
  State.err, State.err, State.err, State.err, State.CS1, State.err, State.err, State.err, State.err, State.err, State.err, State.err,   //- P3A
  State.err, State.err, State.CS1, State.CS1, State.err, State.err, State.err, State.err, State.err, State.err, State.err, State.err,   //- P3B
                              //
  State.err, State.err, State.err, State.CS2, State.CS2, State.err, State.err, State.err, State.err, State.err, State.err, State.err,   //- P4A
  State.err, State.err, State.CS2, State.err, State.err, State.err, State.err, State.err, State.err, State.err, State.err, State.err,   //- P4B
]);

const maTransitionsBig = new Uint8Array(0);


export function convert(input: Uint8Array, length: number, target: Uint32Array) : number {
  let pos = 0;
  let size = 0;
  while (pos < length) {
    const byte = input[pos++];
    if (byte < 0x80) {
      target[size++] = byte;
      continue;
    }
    let cdpt = maFirstUnitTable[byte << 1];
    let curr = maFirstUnitTable[(byte << 1) + 1];
    while (curr > State.ERR) {
      if (pos < length) {
        let unit = input[pos++];
        cdpt = (cdpt << 6) | (unit & 0x3F);
        curr = maTransitions[curr + maOctetCategory[unit]];
      } else {
        curr = State.ERR;
        break;
      }
    }
    if (curr !== State.ERR) {
      target[size++] = cdpt;
    } else {
      // error handling goes here...
    }

  }
  return size;
}



/*
// convert "bytestring" (charCode 0-255) to bytes
function fromByteString(s: string): Uint8Array {
  const result = new Uint8Array(s.length);
  for (let i = 0; i < s.length; ++i) {
    result[i] = s.charCodeAt(i);
  }
  return result;
}

// convert codepoints (UTF32) to string
function toByteString(data: Uint32Array, length: number): string {
  return String.fromCodePoint.apply(null, data.subarray(0, length));
}

const input = fromByteString('\xe2\x82\xac\xe2\x82\xac\xe2\x82\xac\xe2\x82\xac\xe2\x82\xac\xe2\x82\xac\xe2\x82\xac\xe2\x82\xac\xe2\x82\xac\xe2\x82\xac');
const target = new Uint32Array(input.length);
console.log(convert(input, input.length, target));
console.log(toByteString(target, input.length));
*/
