/*
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*
The Copyrighted code was copied and modified for brevity.
It's insertion directly into our codebase is a mitigation strategy against the risk of the original code being modified or removed.

Entropy is calculated as log2(N^L) where N is the number of possible characters and L is the length of the string
For easy-to-read characters, N = 32, so entropy = log2(32^L) = L * log2(32) = L * 5
Length of 5 gives us 25 bits of entropy, which is enough for a token that is only used once
*/

import { randomBytes } from "crypto";
import { promisify } from "util";

const easyReadCharacters = [..."2346789bdfghjmnpqrtBDFGHJLMNPQRT"];

const randomBytesAsync = promisify(randomBytes);

const getRandomBytes = async (size: number) => new Uint8Array(await randomBytesAsync(size));

const readUInt16LE = (uInt8Array: Uint8Array, offset: number) =>
  uInt8Array[offset] + (uInt8Array[offset + 1] << 8);

export const generateTokenCode = async (length = 5) => {
  // Generating entropy is faster than complex math operations, so we use the simplest way
  const characterCount = easyReadCharacters.length;
  const maxValidSelector = Math.floor(0x1_00_00 / characterCount) * characterCount - 1; // Using values above this will ruin distribution when using modular division
  const entropyLength = 2 * Math.ceil(1.1 * length); // Generating a bit more than required so chances we need more than one pass will be really low
  let string = "";
  let stringLength = 0;

  while (stringLength < length) {
    // In case we had many bad values, which may happen for character sets of size above 0x8000 but close to it
    const entropy = await getRandomBytes(entropyLength); // eslint-disable-line no-await-in-loop
    let entropyPosition = 0;

    while (entropyPosition < entropyLength && stringLength < length) {
      const entropyValue = readUInt16LE(entropy, entropyPosition);
      entropyPosition += 2;
      if (entropyValue > maxValidSelector) {
        // Skip values which will ruin distribution when using modular division
        continue;
      }

      string += easyReadCharacters[entropyValue % characterCount];
      stringLength++;
    }
  }

  return string;
};
