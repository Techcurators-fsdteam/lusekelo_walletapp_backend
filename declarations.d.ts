// declarations.d.ts
declare module "jimp" {
  const Jimp: any;
  export default Jimp;
}
// declarations.d.ts
declare module 'qrcode-reader' {
  interface QRCodeReader {
    callback: (err: Error | null, value: { result: string }) => void;
    decode(bitmap: any): void;
  }

  class QRCodeReader implements QRCodeReader {
    constructor();
  }

  export default QRCodeReader;
}
declare module 'jsqr' {
  interface QRCode {
    binaryData: Uint8ClampedArray;
    data: string;
    location: {
      topLeftCorner: { x: number; y: number };
      topRightCorner: { x: number; y: number };
      bottomLeftCorner: { x: number; y: number };
      bottomRightCorner: { x: number; y: number };
    };
  }

  function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' }
  ): QRCode | null;

  export default jsQR;
}