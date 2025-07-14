// Define the options for the visualizer
export const opts = {
	smoothing: 0.8,
	fft: 32,
	minDecibels: -70,
	scale: 0.2,
	glow: 10,
	color1: [178, 75, 243],
	color2: [188, 65, 168],
	color3: [93, 95, 239],
	fillOpacity: 0.6,
	lineWidth: 0.5,
	blend: "screen",
	shift: 30,
	width: 20,
	amp: 1,
};

let animationId; // Store the animation frame ID so we can cancel it
let context = null;
let analyser = null;
let frequencies = null;
let isPaused = false; // Track the pause state

function range(i) {
	return Array.from(Array(i).keys());
}

const shuffle = [1, 3, 0, 4, 2];

function freq(channel, i) {
	const band = 2 * channel + shuffle[i] * 6;
	return frequencies[band];
}

function scale(i) {
	const x = Math.abs(2 - i); // 2,1,0,1,2
	const s = 3 - x; // 1,2,3,2,1
	return (s / 3) * opts.amp;
}

function path(ctx, canvas, channel) {
	const color = opts[`color${channel + 1}`].map(Math.floor);
	ctx.fillStyle = `rgba(${color}, ${opts.fillOpacity})`;
	ctx.strokeStyle = ctx.shadowColor = `rgb(${color})`;
	ctx.lineWidth = opts.lineWidth;
	ctx.shadowBlur = opts.glow;
	ctx.globalCompositeOperation = opts.blend;

	const m = canvas.height / 2; // Use the canvas height here
	const offset = (canvas.width - 15 * opts.width) / 2;
	const x = range(15).map(
		(i) => offset + channel * opts.shift + i * opts.width,
	);

	const y = range(5).map((i) => Math.max(0, m - scale(i) * freq(channel, i)));

	const h = 2 * m;

	ctx.beginPath();
	ctx.moveTo(0, m);
	ctx.lineTo(x[0], m + 1);

	ctx.bezierCurveTo(x[1], m + 1, x[2], y[0], x[3], y[0]);
	ctx.bezierCurveTo(x[4], y[0], x[4], y[1], x[5], y[1]);
	ctx.bezierCurveTo(x[6], y[1], x[6], y[2], x[7], y[2]);
	ctx.bezierCurveTo(x[8], y[2], x[8], y[3], x[9], y[3]);
	ctx.bezierCurveTo(x[10], y[3], x[10], y[4], x[11], y[4]);
	ctx.bezierCurveTo(x[12], y[4], x[12], m, x[13], m);

	ctx.lineTo(canvas.width, m + 1);
	ctx.lineTo(x[13], m - 1);

	ctx.bezierCurveTo(x[12], m, x[12], h - y[4], x[11], h - y[4]);
	ctx.bezierCurveTo(x[10], h - y[4], x[10], h - y[3], x[9], h - y[3]);
	ctx.bezierCurveTo(x[8], h - y[3], x[8], h - y[2], x[7], h - y[2]);
	ctx.bezierCurveTo(x[6], h - y[2], x[6], h - y[1], x[5], h - y[1]);
	ctx.bezierCurveTo(x[4], h - y[1], x[4], h - y[0], x[3], h - y[0]);
	ctx.bezierCurveTo(x[2], h - y[0], x[1], m, x[0], m);

	ctx.lineTo(0, m);

	ctx.fill();
	ctx.stroke();
}

export function visualize(canvas) {
	if (!analyser) {
		console.error("Analyser node is not initialized");
		return;
	}

	const ctx = canvas.getContext("2d");

	analyser.smoothingTimeConstant = opts.smoothing;
	analyser.minDecibels = opts.minDecibels;
	analyser.maxDecibels = 0;
	analyser.getByteFrequencyData(frequencies);

	// Ensure the canvas size matches the container's size
	const { width, height } = canvas.getBoundingClientRect();
	canvas.width = width;
	canvas.height = height;

	path(ctx, canvas, 0);
	path(ctx, canvas, 1);
	path(ctx, canvas, 2);

	if (!isPaused) {
		animationId = setTimeout(() => {
			requestAnimationFrame(() => visualize(canvas));
		}, 100); // Adjust the delay for smoother or slower movement
	}
}

export function startVisualization(canvas, audioStream) {
	if (!context || context.state === "closed") {
		context = new AudioContext();
	}
	if (!analyser) {
		analyser = context.createAnalyser();
		frequencies = new Uint8Array(analyser.frequencyBinCount);
	}

	if (audioStream) {
		const input = context.createMediaStreamSource(audioStream);
		input.connect(analyser);
		isPaused = false; // Reset the pause state
		visualize(canvas);
	} else {
		console.error("No audio stream available for visualization");
	}
}

export function pauseVisualization() {
	isPaused = true; // Set the pause state
	if (animationId) {
		clearTimeout(animationId); // Stop the next animation frame
	}
}

export function resumeVisualization(canvas) {
	if (!analyser) {
		console.error(
			"Cannot resume visualization because the analyser node is not initialized",
		);
		return;
	}
	isPaused = false;
	const { width, height } = canvas.getBoundingClientRect();
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	visualize(canvas);
}

export function stopVisualization() {
	try {
		isPaused = true;
		if (animationId) {
			clearTimeout(animationId);
			cancelAnimationFrame(animationId);
			animationId = null;
		}
		if (context && context.state !== "closed") {
			context.close();
		}
		context = null;
		analyser = null;
		frequencies = null;

		const canvas = document.querySelector("canvas");
		if (canvas) {
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
		}
	} catch (error) {
		console.error("Error stopping visualization", error);
	}
}
