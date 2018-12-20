import { assert } from 'chai';
import { Utf8Decoder, Utf16Decoder, Utf8Decoder16 } from '.';
import { encode } from 'utf8';

// convert "bytestring" (charCode 0-255) to bytes
function fromByteString(s: string): Uint8Array {
  const result = new Uint8Array(s.length);
  for (let i = 0; i < s.length; ++i) {
    result[i] = s.charCodeAt(i);
  }
  return result;
}

// convert codepoints (UTF32) to string
function toByteString(data: Uint32Array | Uint16Array, length: number): string {
  return String.fromCodePoint.apply(null, data.subarray(0, length));
}

describe('utf8 decode', () => {
  describe('full codepoint test', () => {
    it('0..65535 (1/2/3 byte sequences)', () => {
      const decoder = new Utf8Decoder();
      const target = new Uint32Array(5);
      for (let i = 0; i < 65536; ++i) {
        // skip surrogate pairs
        if (i >= 0xD800 && i <= 0xDFFF) {
          continue;
        }
        const utf8_data = fromByteString(encode(String.fromCharCode(i)));
        const length = decoder.decode(utf8_data, target);
        assert.equal(length, 1);
        assert.equal(toByteString(target, length), String.fromCharCode(i));
        decoder.clear();
      }
    });
    it('65536..0x10FFFF (4 byte sequences)', function(): void {
      this.timeout(20000);
      const decoder = new Utf8Decoder();
      const target = new Uint32Array(5);
      for (let i = 65536; i < 0x10FFFF; ++i) {
        const utf8_data = fromByteString(encode(String.fromCodePoint(i)));
        const length = decoder.decode(utf8_data, target);
        assert.equal(length, 1);
        assert.equal(target[0], i);
        decoder.clear();
      }
    });
  });
  describe('stream handling', () => {
    it('2 byte sequences - advance by 1', () => {
      const decoder = new Utf8Decoder();
      const target = new Uint32Array(5);
      const utf8_data = fromByteString('\xc3\x84\xc3\x96\xc3\x9c\xc3\x9f\xc3\xb6\xc3\xa4\xc3\xbc');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; ++i) {
        const written = decoder.decode(utf8_data.slice(i, i + 1), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'ÄÖÜßöäü');
    });
    it('2/3 byte sequences - advance by 1', () => {
      const decoder = new Utf8Decoder();
      const target = new Uint32Array(5);
      const utf8_data = fromByteString('\xc3\x84\xe2\x82\xac\xc3\x96\xe2\x82\xac\xc3\x9c\xe2\x82\xac\xc3\x9f\xe2\x82\xac\xc3\xb6\xe2\x82\xac\xc3\xa4\xe2\x82\xac\xc3\xbc');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; ++i) {
        const written = decoder.decode(utf8_data.slice(i, i + 1), target);//𝄞
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€Ö€Ü€ß€ö€ä€ü');
    });
    it('2/3/4 byte sequences - advance by 1', () => {
      const decoder = new Utf8Decoder();
      const target = new Uint32Array(5);
      const utf8_data = fromByteString('\xc3\x84\xe2\x82\xac\xf0\x9d\x84\x9e\xc3\x96\xf0\x9d\x84\x9e\xe2\x82\xac\xc3\x9c\xf0\x9d\x84\x9e\xe2\x82\xac');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; ++i) {
        const written = decoder.decode(utf8_data.slice(i, i + 1), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€𝄞Ö𝄞€Ü𝄞€');
    });
    it('2/3/4 byte sequences - advance by 2', () => {
      const decoder = new Utf8Decoder();
      const target = new Uint32Array(5);
      const utf8_data = fromByteString('\xc3\x84\xe2\x82\xac\xf0\x9d\x84\x9e\xc3\x96\xf0\x9d\x84\x9e\xe2\x82\xac\xc3\x9c\xf0\x9d\x84\x9e\xe2\x82\xac');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; i += 2) {
        const written = decoder.decode(utf8_data.slice(i, i + 2), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€𝄞Ö𝄞€Ü𝄞€');
    });
    it('2/3/4 byte sequences - advance by 3', () => {
      const decoder = new Utf8Decoder();
      const target = new Uint32Array(5);
      const utf8_data = fromByteString('\xc3\x84\xe2\x82\xac\xf0\x9d\x84\x9e\xc3\x96\xf0\x9d\x84\x9e\xe2\x82\xac\xc3\x9c\xf0\x9d\x84\x9e\xe2\x82\xac');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; i += 3) {
        const written = decoder.decode(utf8_data.slice(i, i + 3), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€𝄞Ö𝄞€Ü𝄞€');
    });
  });
});

describe('utf16 decode', () => {
  describe('full codepoint test', () => {
    it('0..65535', () => {
      const decoder = new Utf16Decoder();
      const target = new Uint32Array(5);
      const utf16_data = new Uint16Array(1);
      for (let i = 0; i < 65536; ++i) {
        // skip surrogate pairs
        if (i >= 0xD800 && i <= 0xDFFF) {
          continue;
        }
        utf16_data[0] = i;
        const length = decoder.decode(utf16_data, target);
        assert.equal(length, 1);
        assert.equal(toByteString(target, length), String.fromCharCode(i));
        decoder.clear();
      }
    });
    it('65536..0x10FFFF (surrogates)', function(): void {
      this.timeout(20000);
      const decoder = new Utf16Decoder();
      const target = new Uint32Array(5);
      const utf16_data = new Uint16Array(2);
      for (let i = 65536; i < 0x10FFFF; ++i) {
        const s = String.fromCodePoint(i);
        utf16_data[0] = s.charCodeAt(0);
        utf16_data[1] = s.charCodeAt(1);
        const length = decoder.decode(utf16_data, target);
        assert.equal(length, 1);
        assert.equal(target[0], i);
        decoder.clear();
      }
    });
  });
  describe('stream handling', () => {
    it('surrogates mixed advance by 1', () => {
      const decoder = new Utf16Decoder();
      const target = new Uint32Array(5);
      const utf16_data = new Uint16Array(fromByteString('\xc4\x00\xac 4\xd8\x1e\xdd\xd6\x004\xd8\x1e\xdd\xac \xdc\x004\xd8\x1e\xdd\xac ').buffer);
      let decoded = '';
      for (let i = 0; i < utf16_data.length; ++i) {
        const written = decoder.decode(utf16_data.slice(i, i + 1), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€𝄞Ö𝄞€Ü𝄞€');
    });
  });
});

describe('utf8 decode16', () => {
  describe('full codepoint test', () => {
    it('0..65535 (1/2/3 byte sequences)', () => {
      const decoder = new Utf8Decoder16();
      const target = new Uint16Array(5);
      for (let i = 0; i < 65536; ++i) {
        // skip surrogate pairs
        if (i >= 0xD800 && i <= 0xDFFF) {
          continue;
        }
        const utf8_data = fromByteString(encode(String.fromCharCode(i)));
        const length = decoder.decode(utf8_data, target);
        assert.equal(length, 1);
        assert.equal(toByteString(target, length), String.fromCharCode(i));
        decoder.clear();
      }
    });
    it('65536..0x10FFFF (4 byte sequences)', function(): void {
      this.timeout(20000);
      const decoder = new Utf8Decoder16();
      const target = new Uint16Array(5);
      for (let i = 65536; i < 0x10FFFF; ++i) {
        const utf8_data = fromByteString(encode(String.fromCodePoint(i)));
        const length = decoder.decode(utf8_data, target);
        assert.equal(length, 2);
        assert.equal(target[0], ((i - 0x10000) >> 10) + 0xD800);
        assert.equal(target[1], ((i - 0x10000) % 0x400) + 0xDC00);
        assert.equal(toByteString(target, 2), String.fromCodePoint(i));
        decoder.clear();
      }
    });
  });
  describe('stream handling', () => {
    it('2 byte sequences - advance by 1', () => {
      const decoder = new Utf8Decoder16();
      const target = new Uint16Array(5);
      const utf8_data = fromByteString('\xc3\x84\xc3\x96\xc3\x9c\xc3\x9f\xc3\xb6\xc3\xa4\xc3\xbc');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; ++i) {
        const written = decoder.decode(utf8_data.slice(i, i + 1), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'ÄÖÜßöäü');
    });
    it('2/3 byte sequences - advance by 1', () => {
      const decoder = new Utf8Decoder16();
      const target = new Uint16Array(5);
      const utf8_data = fromByteString('\xc3\x84\xe2\x82\xac\xc3\x96\xe2\x82\xac\xc3\x9c\xe2\x82\xac\xc3\x9f\xe2\x82\xac\xc3\xb6\xe2\x82\xac\xc3\xa4\xe2\x82\xac\xc3\xbc');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; ++i) {
        const written = decoder.decode(utf8_data.slice(i, i + 1), target);//𝄞
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€Ö€Ü€ß€ö€ä€ü');
    });
    it('2/3/4 byte sequences - advance by 1', () => {
      const decoder = new Utf8Decoder16();
      const target = new Uint16Array(5);
      const utf8_data = fromByteString('\xc3\x84\xe2\x82\xac\xf0\x9d\x84\x9e\xc3\x96\xf0\x9d\x84\x9e\xe2\x82\xac\xc3\x9c\xf0\x9d\x84\x9e\xe2\x82\xac');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; ++i) {
        const written = decoder.decode(utf8_data.slice(i, i + 1), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€𝄞Ö𝄞€Ü𝄞€');
    });
    it('2/3/4 byte sequences - advance by 2', () => {
      const decoder = new Utf8Decoder16();
      const target = new Uint16Array(5);
      const utf8_data = fromByteString('\xc3\x84\xe2\x82\xac\xf0\x9d\x84\x9e\xc3\x96\xf0\x9d\x84\x9e\xe2\x82\xac\xc3\x9c\xf0\x9d\x84\x9e\xe2\x82\xac');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; i += 2) {
        const written = decoder.decode(utf8_data.slice(i, i + 2), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€𝄞Ö𝄞€Ü𝄞€');
    });
    it('2/3/4 byte sequences - advance by 3', () => {
      const decoder = new Utf8Decoder16();
      const target = new Uint16Array(5);
      const utf8_data = fromByteString('\xc3\x84\xe2\x82\xac\xf0\x9d\x84\x9e\xc3\x96\xf0\x9d\x84\x9e\xe2\x82\xac\xc3\x9c\xf0\x9d\x84\x9e\xe2\x82\xac');
      let decoded = '';
      for (let i = 0; i < utf8_data.length; i += 3) {
        const written = decoder.decode(utf8_data.slice(i, i + 3), target);
        decoded += toByteString(target, written);
      }
      assert(decoded, 'Ä€𝄞Ö𝄞€Ü𝄞€');
    });
  });
});