// TypeScript 5.0 の lib.dom には CompressionStream / DecompressionStream が無い (5.1 で追加).
// 実行環境 (モダンブラウザ / Node 18+) には存在するため, ここで型だけ補う.

declare class CompressionStream {
  constructor(format: "gzip" | "deflate" | "deflate-raw");
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
}

declare class DecompressionStream {
  constructor(format: "gzip" | "deflate" | "deflate-raw");
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
}
