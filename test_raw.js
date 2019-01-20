const decode = require('./utf8.js').decode;
const ThroughputRuntimeCase = require('xterm-benchmark').ThroughputRuntimeCase;
const perfContext = require('xterm-benchmark').perfContext;
const Utf8Decoder = require('.').Utf8Decoder;
const Utf8Decoder16 = require('.').Utf8Decoder16;

perfContext('ASCII - aaaaaaaaaa', () => {
  const s = Array(500001).join('aaaaaaaaaa');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();
  const decoder16 = new Utf8Decoder16();
  const target16 = new Uint16Array(s.length);

  new ThroughputRuntimeCase('utf8.js', () => {
    decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();
  
  new ThroughputRuntimeCase('Utf8Decoder', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();

  new ThroughputRuntimeCase('Utf8Decoder16', () => {
    decoder16.decode(buf, target16);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();
});

perfContext('2 byte - ääääääääää', () => {
  const s = Array(500001).join('ääääääääää');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();
  const decoder16 = new Utf8Decoder16();
  const target16 = new Uint16Array(s.length);

  new ThroughputRuntimeCase('utf8.js', () => {
    decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();
  
  new ThroughputRuntimeCase('Utf8Decoder', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();

  new ThroughputRuntimeCase('Utf8Decoder16', () => {
    decoder16.decode(buf, target16);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();
});

perfContext('3 byte - €€€€€€€€€€', () => {
  const s = Array(500001).join('€€€€€€€€€€');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();
  const decoder16 = new Utf8Decoder16();
  const target16 = new Uint16Array(s.length);

  new ThroughputRuntimeCase('utf8.js', () => {
    decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();
  
  new ThroughputRuntimeCase('Utf8Decoder', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();

  new ThroughputRuntimeCase('Utf8Decoder16', () => {
    decoder16.decode(buf, target16);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();
});

perfContext('4 byte - 𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞', () => {
  const s = Array(500001).join('𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();
  const decoder16 = new Utf8Decoder16();
  const target16 = new Uint16Array(s.length);

  new ThroughputRuntimeCase('utf8.js', () => {
    decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();
  
  new ThroughputRuntimeCase('Utf8Decoder', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();

  new ThroughputRuntimeCase('Utf8Decoder16', () => {
    decoder16.decode(buf, target16);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageThroughput();
});
