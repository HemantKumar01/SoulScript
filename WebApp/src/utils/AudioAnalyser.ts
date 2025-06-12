/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/** Simple class for getting the current audio level. */
export class AudioAnalyser {
  readonly node: AnalyserNode;
  private readonly freqData: Uint8Array;
  constructor(context: AudioContext) {
    this.node = context.createAnalyser();
    this.node.smoothingTimeConstant = 0;
    this.freqData = new Uint8Array(this.node.frequencyBinCount);
  }
  getCurrentLevel() {
    this.node.getByteFrequencyData(this.freqData);
    const avg = this.freqData.reduce((a, b) => a + b, 0) / this.freqData.length;
    return avg / 0xff;
  }
}
