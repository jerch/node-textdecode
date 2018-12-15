const decode = require('./utf8.js').decode;
const ThroughputRuntimeCase = require('xterm-benchmark').ThroughputRuntimeCase;
const perfContext = require('xterm-benchmark').perfContext;
const Utf8Decoder = require('.').Utf8Decoder;

/*
const s = Array(5000001).join('€€€€€€€€€€');
const buf = new Uint8Array(Buffer.from(s));
const target = new Uint32Array(s.length);
let count = 0;
let start = (new Date()).getTime();
decode(buf, target);
let end = (new Date()).getTime();
console.log(count, end - start);
console.log(s.length/(end - start)/1024);


const Throughput = require('xterm-benchmark').ThroughputRuntimeCase;
const before = require('xterm-benchmark').before;
*/

perfContext('ASCII - aaaaaaaaaa', () => {
  const s = Array(5000001).join('aaaaaaaaaa');
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
  const s = Array(5000001).join('ääääääääää');
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
  const s = Array(5000001).join('€€€€€€€€€€');
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
  const s = Array(5000001).join('𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞');
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

const convert = require('./lib/decoder_new').convert;

perfContext('compare', () => {
  const s = Array(5000001).join('aaaaaaaaaa');
  const buf = new Uint8Array(Buffer.from(s));
  const target = new Uint32Array(s.length);
  const decoder = new Utf8Decoder();

  new ThroughputRuntimeCase('decode', () => {
    decoder.decode(buf, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
  
  new ThroughputRuntimeCase('decode_new', () => {
    // decoder.decode_new(buf, target);
    convert(buf, buf.length, target);
    return {payloadSize: s.length};
  }, {fork: true}).showAverageRuntime().showAverageThroughput();
});