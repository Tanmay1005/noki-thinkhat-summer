// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
class AudioProcess extends AudioWorkletProcessor {
	constructor() {
		super();
		this.buffer = [];
		this.noiseThreshold = 0.08;
		this.gateOpen = false;
		this.gateHoldTime = 0;
		this.lastGateCloseTime = 0;
		this.noiseGate = 0;
	}

	static get parameterDescriptors() {
		return [
			// { name: "desiredSampleRate", defaultValue: 16000 },
			// { name: "encoded16bit", defaultValue: 0 },
			// { name: "bufferSize", defaultValue: 4096 },
			// { name: "noiseThreshold", defaultValue: 0.01 },
			{ name: "desiredSampleRate", defaultValue: 16000 },
			{ name: "encoded16bit", defaultValue: 0 },
			{ name: "bufferSize", defaultValue: 4096 },
			{ name: "noiseThreshold", defaultValue: 0.08 },
			{ name: "attackTime", defaultValue: 0.01 },
			{ name: "holdTime", defaultValue: 0.1 },
			{ name: "releaseTime", defaultValue: 0.2 },
			{ name: "noiseGate", defaultValue: 0 },
		];
	}

	applyNoiseGate(buffer, threshold, attackTime, holdTime, releaseTime) {
		const outputBuffer = new Float32Array(buffer.length);
		// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
		const currentTime = currentFrame / sampleRate;

		for (let i = 0; i < buffer.length; i++) {
			const inputValue = buffer[i];

			if (Math.abs(inputValue) > threshold) {
				// Signal is above the threshold
				this.gateOpen = true;
				this.gateHoldTime = currentTime + holdTime;
			} else if (this.gateOpen && currentTime > this.gateHoldTime) {
				// Signal is below threshold and hold time has passed
				if (this.lastGateCloseTime === 0) {
					this.lastGateCloseTime = currentTime;
				}

				const timeSinceGateHold = currentTime - this.gateHoldTime;
				const releaseProgress = Math.min(timeSinceGateHold / releaseTime, 1);

				if (releaseProgress >= 1) {
					this.gateOpen = false;
					this.lastGateCloseTime = 0;
				} else {
					outputBuffer[i] = inputValue * (1 - releaseProgress);
					continue;
				}
			}

			// Apply gate
			if (this.gateOpen || currentTime - this.lastGateCloseTime < attackTime) {
				const attackProgress = Math.min(
					(currentTime - this.lastGateCloseTime) / attackTime,
					1,
				);
				outputBuffer[i] = inputValue * attackProgress;
			} else {
				outputBuffer[i] = 0;
			}
		}

		return outputBuffer;
	}

	downsampleBuffer(buffer, inputSampleRate, outputSampleRate) {
		if (inputSampleRate === outputSampleRate) {
			return buffer;
		}

		const sampleRateRatio = inputSampleRate / outputSampleRate;
		const newLength = Math.round(buffer.length / sampleRateRatio);
		const result = new Float32Array(newLength);
		let offsetBuffer = 0;

		for (let i = 0; i < newLength; i++) {
			const nextOffsetBuffer = Math.round((i + 1) * sampleRateRatio);
			let accum = 0;
			let count = 0;

			for (
				let j = offsetBuffer;
				j < nextOffsetBuffer && j < buffer.length;
				j++
			) {
				accum += buffer[j];
				count++;
			}

			result[i] = accum / count;
			offsetBuffer = nextOffsetBuffer;
		}

		return result;
	}

	pcmEncode(input) {
		const buffer = new ArrayBuffer(input.length * 2);
		const view = new DataView(buffer);
		for (let i = 0; i < input.length; i++) {
			const s = Math.max(-1, Math.min(1, input[i]));
			view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
		}
		return buffer;
	}

	process(inputs, outputs, parameters) {
		const input = inputs[0];
		const output = outputs[0];
		if (input.length > 0) {
			const inputChannel = input[0];
			const outputChannel = output[0];
			this.buffer.push(...inputChannel);

			// this.noiseThreshold = parameters.noiseThreshold[0];
			// const bufferSize = parameters.bufferSize[0];

			const bufferSize = parameters.bufferSize[0];
			this.noiseThreshold = parameters.noiseThreshold[0];
			const attackTime = parameters.attackTime[0];
			const holdTime = parameters.holdTime[0];
			const releaseTime = parameters.releaseTime[0];

			if (this.buffer.length >= bufferSize) {
				let downsampledData = this.buffer.slice(0, bufferSize);
				this.buffer = this.buffer.slice(bufferSize);

				// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
				const originalSampleRate = sampleRate;
				const desiredSampleRate = parameters.desiredSampleRate[0];

				if (originalSampleRate > desiredSampleRate) {
					downsampledData = this.downsampleBuffer(
						downsampledData,
						originalSampleRate,
						desiredSampleRate,
					);
				}

				if (parameters.noiseGate[0] === 1) {
					downsampledData = this.applyNoiseGate(
						downsampledData,
						this.noiseThreshold,
						attackTime,
						holdTime,
						releaseTime,
					);
				}

				if (parameters.encoded16bit[0] === 1) {
					downsampledData = this.pcmEncode(downsampledData);
				}

				this.port.postMessage(downsampledData);

				for (let i = 0; i < downsampledData.length; i++) {
					outputChannel[i] = downsampledData[i];
				}
			}
		}

		return true;
	}
}

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
registerProcessor("audio-process", AudioProcess);
