/**
 * Text Trancoders based on typed arrays.
 * 
 * Note on endianess: Since the typed arrays are meant for internal representation only,
 * the endianess follows the system default.
 * 
 * TODO: customizable error handling:
 *    - ignore:   faulty sequences are silently swallowed (currently hardcoded)
 *    - replace:  replace faulty sequences with '\uFFFD' (recommended by unicode consortium)
 *    - strict:   raise Error
 */


/**
 * Utf8Decoder - decodes UTF8 byte sequences into UTF32 codepoints.
 */
export class Utf8Decoder {
  public interim: Uint8Array = new Uint8Array(3);

  /**
   * Clears interim bytes and resets decoder to clean state.
   */
  public clear(): void {
    this.interim.fill(0);
  }

  /**
   * Decodes UTF8 byte sequences in `input` to UTF32 codepoints in `target`.
   * The methods assumes stream input and will store partly transmitted bytes
   * and decode them with the next data chunk.
   * Note: The method does no bound checks for target, therefore make sure
   * the provided data chunk does not exceed the size of `target`.
   */
  decode(input: Uint8Array, target: Uint32Array): number {
    const length = input.length;

    if (!length) {
      return 0;
    }

    let size = 0;
    let byte1, byte2, byte3, byte4;
    let codepoint = 0;
    let startPos = 0;

    // handle leftover bytes
    if (this.interim[0]) {
      let discardInterim = false;
      let cp = this.interim[0];
      cp &= ((((cp & 0xE0) == 0xC0)) ? 0x1F : (((cp & 0xF0) == 0xE0)) ? 0x0F : 0x07);
      let pos = 0;
      let tmp;
      while ((tmp = this.interim[++pos] & 0x3F) && pos < 4) {
        cp <<= 6;
        cp |= tmp;
      }
      // missing bytes - read ahead from input
      const type = (((this.interim[0] & 0xE0) == 0xC0)) ? 2 : (((this.interim[0] & 0xF0) == 0xE0)) ? 3 : 4;
      let missing = type - pos;
      while (startPos < missing) {
        if (startPos >= length) {
          return 0;
        }
        tmp = input[startPos++];
        if ((tmp & 0xC0) !== 0x80) {
          // wrong continuation, discard interim bytes completely
          startPos--;
          discardInterim = true;
          break;
        } else {
          // need to save so we can continue short inputs in next call
          this.interim[pos++] = tmp;
          cp <<= 6;
          cp |= tmp & 0x3F;
        }
      }
      if (!discardInterim) {
        // final test is type dependent
        if (type === 2) {
          if (cp < 0x80) {
            // wrong starter byte
            startPos--;
          } else {
            target[size++] = cp;
          }
        } else if (type === 3) {
          if (cp < 0x0800 || (cp >= 0xD800 && cp <= 0xDFFF)) {
            // illegal codepoint
          } else {
            target[size++] = cp;
          }
        } else {
          if (codepoint < 0x010000 || codepoint > 0x10FFFF) {
            // illegal codepoint
          } else {
            target[size++] = cp;
          }
        }
      }
      this.interim.fill(0);
    }

    // loop through input
    let i = startPos;
    while (i < length) {
        byte1 = input[i++];

        // 1 byte
        if (byte1 < 0x80) {
          target[size++] = byte1;
        
        // 2 bytes
        } else if ((byte1 & 0xE0) == 0xC0) {
          if (i >= length) {
            this.interim[0] = byte1;
            return size;
          }
          byte2 = input[i++];
          if ((byte2 & 0xC0) !== 0x80) {
            // wrong continuation
            i--;
            continue;
          }
          codepoint = (byte1 & 0x1F) << 6 | (byte2 & 0x3F);
          if (codepoint < 0x80) {
            // wrong starter byte
            i--;
            continue;
          }
          target[size++] = codepoint;
        
        // 3 bytes
        } else if ((byte1 & 0xF0) == 0xE0) {
          if (i >= length) {
            this.interim[0] = byte1;
            return size;
          }
          byte2 = input[i++];
          if ((byte2 & 0xC0) !== 0x80) {
            // wrong continuation
            i--;
            continue;
          }
          if (i >= length) {
            this.interim[0] = byte1;
            this.interim[1] = byte2;
            return size;
          }
          byte3 = input[i++];
          if ((byte3 & 0xC0) !== 0x80) {
            // wrong continuation
            i--;
            continue;
          }
          codepoint = (byte1 & 0x0F) << 12 | (byte2 & 0x3F) << 6 | (byte3 & 0x3F);
          if (codepoint < 0x0800 || (codepoint >= 0xD800 && codepoint <= 0xDFFF)) {
            // illegal codepoint, no i-- here
            continue;
          }
          target[size++] = codepoint;

        // 4 bytes
        } else if ((byte1 & 0xF8) == 0xF0) {
          if (i >= length) {
            this.interim[0] = byte1;
            return size;
          }
          byte2 = input[i++];
          if ((byte2 & 0xC0) !== 0x80) {
            // wrong continuation
            i--;
            continue;
          }
          if (i >= length) {
            this.interim[0] = byte1;
            this.interim[1] = byte2;
            return size;
          }
          byte3 = input[i++];
          if ((byte3 & 0xC0) !== 0x80) {
            // wrong continuation
            i--;
            continue;
          }
          if (i >= length) {
            this.interim[0] = byte1;
            this.interim[1] = byte2;
            this.interim[2] = byte3;
            return size;
          }
          byte4 = input[i++];
          if ((byte4 & 0xC0) !== 0x80) {
            // wrong continuation
            i--;
            continue;
          }
          codepoint = (byte1 & 0x07) << 18 | (byte2 & 0x3F) << 12 | (byte3 & 0x3F) << 6 | (byte4 & 0x3F);
          if (codepoint < 0x010000 || codepoint > 0x10FFFF) {
            // illegal codepoint, no i-- here
            continue;
          }
          target[size++] = codepoint;
        } else {
          // illegal byte, just skip
        }
    }
    return size;
  }

  decode_new(input: Uint8Array, target: Uint32Array): number {
    let i, len, c;
    let char2, char3;

    len = input.length;
    i = 0;
    let size = 0;
    while (i < len) {
      c = input[i++];
      switch (c >> 4)
      { 
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
          // 0xxxxxxx
          target[size++] = c;
          break;
        case 12: case 13:
          // 110x xxxx   10xx xxxx
          char2 = input[i++];
          target[size++] = ((c & 0x1F) << 6) | (char2 & 0x3F);
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = input[i++];
          char3 = input[i++];
          target[size++] = ((c & 0x0F) << 12) |
                                    ((char2 & 0x3F) << 6) |
                                    ((char3 & 0x3F) << 0);
          break;
      }
    }    
    return size;
  }
}

/**
 * Utf16Decoder - decodes UTF16 sequences into UTF32 codepoints.
 * To keep the decoder in line with JS strings it handles single surrogates as UCS2.
 */
export class Utf16Decoder {
  public interim: number = 0;

  /**
   * Clears interim and resets decoder to clean state.
   */
  public clear(): void {
    this.interim = 0;
  }

  /**
   * Decodes UTF16 sequences in `input` to UTF32 codepoints in `target`.
   * The methods assumes stream input and will store partly transmitted
   * surrogate pairs and decode them with the next data chunk.
   * Note: The method does no bound checks for target, therefore make sure
   * the provided input data does not exceed the size of `target`.
   */
  decode(input: Uint16Array, target: Uint32Array): number {
    const length = input.length;

    if (!length) {
      return 0;
    }

    let size = 0;
    let startPos = 0;

    if (this.interim) {
      const second = input[startPos++];
      if (0xDC00 <= second && second <= 0xDFFF) {
        target[size++] = (this.interim - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      } else {
        // illegal codepoint (USC2 handling)
        target[size++] = this.interim;
        target[size++] = second;
      }
      this.interim = 0;
    }

    for (let i = startPos; i < length; ++i) {
      let code = input[i];
      // surrogate pair first
      if (0xD800 <= code && code <= 0xDBFF) {
        if (++i >= length) {
          this.interim = code;
          return size;
        }
        const second = input[i];
        if (0xDC00 <= second && second <= 0xDFFF) {
          target[size++] = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        } else {
          // illegal codepoint (USC2 handling)
          target[size++] = code;
          target[size++] = second;
        }
        continue;
      }
      target[size++] = code;
    }
    return size;
  }

  /**
   * Decode JS string to UTF32 codepoints.
   * The methods assumes stream input and will store partly transmitted
   * surrogate pairs and decode them with the next data chunk.
   * Note: The method does no bound checks for target, therefore make sure
   * the provided input data does not exceed the size of `target`.
   */
  decodeString(input: string, target: Uint32Array): number {
    const length = input.length;

    if (!length) {
      return 0;
    }

    let size = 0;
    let startPos = 0;

    if (this.interim) {
      const second = input.charCodeAt(startPos++);
      if (0xDC00 <= second && second <= 0xDFFF) {
        target[size++] = (this.interim - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      } else {
        // illegal codepoint (USC2 handling)
        target[size++] = this.interim;
        target[size++] = second;
      }
      this.interim = 0;
    }

    for (let i = startPos; i < length; ++i) {
      let code = input.charCodeAt(i);
      // surrogate pair first
      if (0xD800 <= code && code <= 0xDBFF) {
        if (++i >= length) {
          this.interim = code;
          return size;
        }
        const second = input.charCodeAt(i);
        if (0xDC00 <= second && second <= 0xDFFF) {
          target[size++] = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        } else {
          // illegal codepoint (USC2 handling)
          target[size++] = code;
          target[size++] = second;
        }
        continue;
      }
      target[size++] = code;
    }
    return size;
  }
}
