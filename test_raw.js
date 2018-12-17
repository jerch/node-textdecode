const decode = require('./utf8.js').decode;
const ThroughputRuntimeCase = require('xterm-benchmark').ThroughputRuntimeCase;
const perfContext = require('xterm-benchmark').perfContext;
const Utf8Decoder = require('.').Utf8Decoder;

perfContext('ASCII - aaaaaaaaaa', () => {
  const s = Array(500001).join('aaaaaaaaaa');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();

  new ThroughputRuntimeCase('utf8.js', () => {
    decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
  
  new ThroughputRuntimeCase('Utf8Decoder', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
});

perfContext('2 byte - ääääääääää', () => {
  const s = Array(500001).join('ääääääääää');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();

  new ThroughputRuntimeCase('utf8.js', () => {
    decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
  
  new ThroughputRuntimeCase('Utf8Decoder', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
});

perfContext('3 byte - €€€€€€€€€€', () => {
  const s = Array(500001).join('€€€€€€€€€€');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();

  new ThroughputRuntimeCase('utf8.js', () => {
    decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
  
  new ThroughputRuntimeCase('Utf8Decoder', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
});

perfContext('4 byte - 𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞', () => {
  const s = Array(500001).join('𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();

  new ThroughputRuntimeCase('utf8.js', () => {
    decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
  
  new ThroughputRuntimeCase('Utf8Decoder', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
});

perfContext('compare', () => {
  const s = Array(5000001).join('aaaaaaaaaa');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();

  new ThroughputRuntimeCase('decode', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
});
