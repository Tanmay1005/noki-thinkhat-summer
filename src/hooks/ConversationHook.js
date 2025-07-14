import { calculateAge } from "helpers/common_helper";
import { createPromptFromObject } from "helpers/html_to_markdown_helper";
import protobuf from "protobufjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
	addTranscription,
	resetStates,
	setPaused,
	setRecording,
	setRecordingTime,
} from "../redux/slices/speechSlice";

const SAMPLE_RATE = 16000;
const NUM_CHANNELS = 1;

const useConversation = ({
	audioProcessing = true,
	virtualPatientDetails = "",
	handleWebsocketClose,
	showMicPermissionPopup,
} = {}) => {
	const websocketRef = useRef(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const audioContextRef = useRef(null);
	const mediaStreamRef = useRef(null);
	const isPausedRef = useRef(false);
	const conversationListRef = useRef([]);
	const [conversationList, setConversationList] = useState([]);
	const currentMessageRef = useRef("");
	const [currentMessage, setCurrentMessage] = useState("");
	const sourceNodeRef = useRef(null);
	const audioBufferQueueRef = useRef([]);
	const [formCompleted, _setFormCompleted] = useState(false);
	const [formResponse, _setFormResponse] = useState([]);
	const _formCompletedRef = useRef(false);
	const _formResponseRef = useRef([]);
	const isAnalyzing = useRef(false);
	const tokenRef = useRef("");

	tokenRef.current = localStorage.getItem("jwtToken");

	const [agentSpeaking, setAgentSpeaking] = useState(false);

	const { isRecording, isPaused, recordingTime } = useSelector(
		(state) => state?.speech,
	);

	const [_frameType, setFrameType] = useState(null);
	const frameTypeRef = useRef(null);

	const timerRef = useRef();

	const playTimeRef = useRef(0);
	const lastMessageTimeRef = useRef(0);

	const reduxDispatch = useDispatch();

	const userRoles = {
		user: "Doctor",
		ai: "Patient",
	};

	useEffect(() => {
		const loadProto = async () => {
			try {
				const root = await protobuf.load("/frames.proto");
				const Frame = root.lookupType("pipecat.Frame");
				frameTypeRef.current = Frame;
				setFrameType(frameTypeRef.current);
			} catch (err) {
				console.error("Error loading proto file:", err);
			}
		};

		loadProto();
	}, []);

	const requestAudioPermission = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					sampleRate: SAMPLE_RATE,
					channelCount: NUM_CHANNELS,
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
			});
			mediaStreamRef.current = stream;
			return true;
		} catch (error) {
			console.error("Error requesting audio permission:", error);
			showMicPermissionPopup();
			return false;
		}
	}, []);

	useEffect(() => {
		if (isRecording && !isPaused) {
			timerRef.current = setInterval(() => {
				reduxDispatch(setRecordingTime(recordingTime + 1));
			}, 1000);
			// enableWakeLock();
		} else {
			clearInterval(timerRef.current);
			// disableWakeLock();
		}
		return () => {
			clearInterval(timerRef.current);
			// disableWakeLock();
		};
	}, [isRecording, isPaused, recordingTime, reduxDispatch]);

	useEffect(() => {
		if (sourceNodeRef?.current?.buffer) {
			setAgentSpeaking(true);
		} else {
			setAgentSpeaking(false);
		}
	}, [sourceNodeRef?.current?.buffer]);

	const audioWorkletProcessNode = async () => {
		if (!window.AudioWorkletNode) {
			console.error("AudioWorkletNode is not supported in this browser");
			return;
		}

		if (!audioContextRef.current) {
			try {
				audioContextRef.current = new AudioContext();
			} catch (e) {
				console.error("Error creating audio context", e);
				return null;
			}
		}

		let processorNode = null;
		try {
			await audioContextRef.current.audioWorklet.addModule(
				"/audio-processor.js",
			);
			processorNode = new AudioWorkletNode(
				audioContextRef.current,
				"audio-process",
			);
		} catch (e) {
			console.error(`** Error: Unable to create worklet node: ${e}`);
			return null;
		}

		await audioContextRef.current.resume();
		return processorNode;
	};

	const convertBrowserStreamToAudioStreamUsingWorklet = async () => {
		const stream = mediaStreamRef.current;
		if (!stream) {
			console.error("No media stream available");
			return;
		}
		try {
			const workletNode = await audioWorkletProcessNode();
			if (!audioContextRef.current || !workletNode) {
				return;
			}
			const source = audioContextRef.current.createMediaStreamSource(stream);

			// Create band-pass filter to allow only frequencies within the speech range (e.g., 300 Hz to 3000 Hz)
			const bandPassFilter = audioContextRef.current.createBiquadFilter();
			bandPassFilter.type = "bandpass";
			bandPassFilter.frequency.setValueAtTime(
				1000,
				audioContextRef.current.currentTime,
			); // Center frequency around 1000 Hz (mid-range of speech)
			bandPassFilter.Q.setValueAtTime(1, audioContextRef.current.currentTime); // Adjust bandwidth (higher Q means narrower range)

			// Create a dynamic compressor to handle sharp spikes and reduce overall volume variance
			const compressor = audioContextRef.current.createDynamicsCompressor();
			compressor.threshold.setValueAtTime(
				-50,
				audioContextRef.current.currentTime,
			); // Less aggressive to avoid cutting voice
			compressor.knee.setValueAtTime(40, audioContextRef.current.currentTime);
			compressor.ratio.setValueAtTime(15, audioContextRef.current.currentTime); // Higher ratio for stronger compression
			compressor.attack.setValueAtTime(
				0.01,
				audioContextRef.current.currentTime,
			); // Fast attack to catch noise quickly
			compressor.release.setValueAtTime(
				0.2,
				audioContextRef.current.currentTime,
			); // Faster release to avoid echo

			// Apply active noise cancellation logic
			const delayNode = audioContextRef.current.createDelay();
			delayNode.delayTime.setValueAtTime(
				0.015,
				audioContextRef.current.currentTime,
			); // Small delay to align with noise profile

			const invertGain = audioContextRef.current.createGain();
			invertGain.gain.setValueAtTime(-1, audioContextRef.current.currentTime); // Invert the signal to cancel out noise

			// Connect everything
			if (workletNode.parameters) {
				const desiredSampleRate =
					workletNode.parameters.get("desiredSampleRate");
				const encoded16bit = workletNode.parameters.get("encoded16bit");
				const bufferSize = workletNode.parameters.get("bufferSize");
				const noiseGate = workletNode.parameters.get("noiseGate");

				if (desiredSampleRate) {
					desiredSampleRate.setValueAtTime(
						16000,
						audioContextRef.current.currentTime,
					);
				}
				if (encoded16bit) {
					encoded16bit.setValueAtTime(1, audioContextRef.current.currentTime);
				}
				if (bufferSize) {
					bufferSize.setValueAtTime(1024, audioContextRef.current.currentTime);
				}
				if (noiseGate) {
					noiseGate.setValueAtTime(
						audioProcessing ? 1 : 0,
						audioContextRef.current.currentTime,
					);
				}
			}

			if (audioProcessing) {
				// Route the audio stream through the band-pass filter, compressor, delay, and inverted gain
				source.connect(bandPassFilter);
				bandPassFilter.connect(compressor);
				compressor.connect(delayNode);
				delayNode.connect(invertGain);
				invertGain.connect(workletNode);
			} else {
				source.connect(workletNode);
			}

			workletNode.port.onmessage = (event) => {
				if (!frameTypeRef.current || !websocketRef.current) return;
				const pcmEncodedData = event.data;
				const audioBytes = new Uint8Array(pcmEncodedData);
				const frame = frameTypeRef.current.create({
					audio: {
						audio: Array.from(audioBytes),
						sampleRate: SAMPLE_RATE,
						numChannels: NUM_CHANNELS,
					},
				});
				const encodedFrame = new Uint8Array(
					frameTypeRef.current.encode(frame).finish(),
				);
				if (!isPausedRef.current) {
					if (websocketRef.current?.readyState !== WebSocket.OPEN) return;
					websocketRef.current.send(encodedFrame);
				}
			};
		} catch (e) {
			console.error(e);
		}
	};

	const updateConversationList = ({
		message = "",
		user = "",
		isFinal = false,
	} = {}) => {
		if (isFinal) {
			currentMessageRef.current = {};
			setCurrentMessage(currentMessageRef.current);
			conversationListRef.current.push({
				speakerId: userRoles[user],
				speakerText: message,
			});
			reduxDispatch(
				addTranscription({
					speakerId: userRoles[user],
					speakerText: message,
				}),
			);
			setConversationList(conversationListRef.current);
		} else {
			currentMessageRef.current = {
				speakerId: userRoles[user],
				speakerText: message,
			};
			setCurrentMessage(currentMessageRef.current);
		}
	};

	const MIN_AUDIO_DURATION_SEC = 0.01; // 10ms (relaxed for real-time TTS)
	const MAX_RESET_DRIFT_SEC = 1.0; // 1 second

	const playAudioChunk = async (buffer) => {
		if (!audioContextRef.current) {
			audioContextRef.current = new (
				window.AudioContext || window.webkitAudioContext
			)({
				sampleRate: SAMPLE_RATE,
				latencyHint: "interactive",
			});
		}

		const int16 = new Int16Array(buffer);
		const float32 = new Float32Array(int16.length);

		for (let i = 0; i < int16.length; i++) {
			float32[i] = int16[i] / 32768;
		}

		const audioCtx = audioContextRef.current;
		const audioBuffer = audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
		audioBuffer.copyToChannel(float32, 0);

		if (!audioBuffer) return;

		if (audioBuffer.duration < MIN_AUDIO_DURATION_SEC) {
			console.warn("Skipping too small audio chunk:", audioBuffer.duration);
			return;
		}

		const now = audioCtx.currentTime;

		if (
			playTimeRef.current < now ||
			playTimeRef.current - now > MAX_RESET_DRIFT_SEC
		) {
			// Timeline drift detected: either in past or too far in future
			console.warn("Resetting playback timeline:", {
				playTime: playTimeRef.current,
				now,
			});
			playTimeRef.current = now;
		}

		const sourceNode = audioCtx.createBufferSource();
		sourceNode.buffer = audioBuffer;
		sourceNode.connect(audioCtx.destination);

		sourceNode.start(playTimeRef.current);

		playTimeRef.current += audioBuffer.duration;
		lastMessageTimeRef.current = now;
	};

	// const playAudioChunk = async (buffer) => {
	//   if (!audioContextRef.current) {
	//     audioContextRef.current = new (window.AudioContext ||
	//       window.webkitAudioContext)({
	//       sampleRate: SAMPLE_RATE,
	//       latencyHint: "interactive",
	//     });
	//   }

	//   const int16 = new Int16Array(buffer);
	//   const float32 = new Float32Array(int16.length);

	//   for (let i = 0; i < int16.length; i++) {
	//     float32[i] = int16[i] / 32768;
	//   }

	//   const audioCtx = audioContextRef.current;
	//   const audioBuffer = audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
	//   audioBuffer.copyToChannel(float32, 0);

	//   if (!audioBuffer) return;

	//   const now = audioCtx.currentTime;
	//   const diff = now - lastMessageTimeRef.current;

	//   if (playTimeRef.current === 0 || diff > PLAY_TIME_RESET_THRESHOLD_MS) {
	//     playTimeRef.current = now;
	//   }

	//   lastMessageTimeRef.current = now;

	//   const sourceNode = audioCtx.createBufferSource();
	//   sourceNode.buffer = audioBuffer;
	//   sourceNode.connect(audioCtx.destination);
	//   sourceNode.start(playTimeRef.current); // SCHEDULED start

	//   playTimeRef.current += audioBuffer.duration;
	// };

	// const formatAndPlayBuffers = (base64AudioChunks) => {
	//   const decodedData = atob(base64AudioChunks);
	//   const byteArray = new Uint8Array(decodedData.length);
	//   for (let i = 0; i < decodedData.length; i++) {
	//     byteArray[i] = decodedData.charCodeAt(i);
	//   }
	//   playAudioChunk(byteArray.buffer);
	// };

	const stopAudio = () => {
		if (sourceNodeRef.current) {
			sourceNodeRef.current.stop();
			sourceNodeRef.current.disconnect();
			sourceNodeRef.current = null;
		}
		audioBufferQueueRef.current = [];
	};

	const processJsonMessage = (message) => {
		try {
			const parsedMessage = JSON.parse(message);

			// if (parsedMessage?.type === "events") {
			//   const payload = parsedMessage.payload;
			//   formCompletedRef.current = false;
			//   if (payload?.event === "end_form") {
			//     formCompletedRef.current = true;
			//     formResponseRef.current = payload?.data;
			//     stopConversation();
			//   }
			//   setFormCompleted(formCompletedRef.current);
			//   setFormResponse(formResponseRef.current);
			// }

			if (parsedMessage?.type === "request_text") {
				if (!parsedMessage.message) return;
				stopAudio();
				updateConversationList({
					message: parsedMessage.message,
					user: "user",
					isFinal: parsedMessage.is_final,
				});
			}

			if (parsedMessage?.type === "response_text") {
				if (!parsedMessage.message) return;
				updateConversationList({
					message: parsedMessage.message,
					user: "ai",
					isFinal: parsedMessage.is_final,
				});

				// if (!parsedMessage.audio_chunk) return;

				// formatAndPlayBuffers(parsedMessage.audio_chunk);
			}

			// if (parsedMessage?.type === "audio_response") {
			//   if (!parsedMessage.audio_chunk) return;
			//   formatAndPlayBuffers(parsedMessage.audio_chunk);
			// }
		} catch (e) {
			console.error(e);
		}
	};

	const startConversation = useCallback(async () => {
		setIsConnecting(true);

		const isPermission = await requestAudioPermission();

		if (!isPermission) return;
		if (!tokenRef.current) return;

		let retries = 0;
		const maxRetries = 3;
		const websocketUrl = `${process.env.REACT_APP_AGENT_SERVICE_URL}/v1/users/ws/completions?token=${tokenRef.current}`;

		const connect = () => {
			websocketRef.current = new WebSocket(websocketUrl);
			websocketRef.current.binaryType = "arraybuffer";

			websocketRef.current.onmessage = (event) => {
				if (typeof event.data === "string") {
					processJsonMessage(event.data);
				}

				if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
					if (!frameTypeRef.current) return;
					const arrayBuffer = event.data;
					const frame = frameTypeRef.current.decode(
						new Uint8Array(arrayBuffer),
					);
					if (frame?.audio?.audio?.length > 0) {
						const audioUint8 = new Uint8Array(frame.audio.audio);
						playAudioChunk(audioUint8.buffer);
					}
				}
			};

			websocketRef.current.onopen = () => {
				reduxDispatch(setRecording(true));
				setIsConnecting(false);
				setRetryCount(0);
				const gender =
					virtualPatientDetails?.gender?.toLowerCase() === "male"
						? "male"
						: "female";
				const initialSetupMessage = {
					request_text: "initialize",
					prompt_code: "virtual-patient",
					custom_prompt: createPromptFromObject(virtualPatientDetails),
					gender,
					age: calculateAge(virtualPatientDetails?.birthDate),
				};
				websocketRef.current?.send(JSON.stringify(initialSetupMessage));

				convertBrowserStreamToAudioStreamUsingWorklet();
			};

			websocketRef.current.onerror = (error) => {
				console.error("WebSocket error:", error);
				reduxDispatch(resetStates());
				if (!isAnalyzing.current && retries < maxRetries) {
					retries += 1;
					setRetryCount(retries);
					setTimeout(connect, 1000);
				} else {
					setIsConnecting(false);
					console.error("Failed to connect after 3 attempts");
				}
			};

			websocketRef.current.onclose = (_event) => {
				// if (!event.wasClean && !isAnalyzing.current) {
				if (!isAnalyzing.current) {
					pauseConversation();
					handleWebsocketClose();
				}
			};
		};

		connect();
	}, [virtualPatientDetails?.id, virtualPatientDetails?.fhir_questionnaire_id]);

	const stopConversation = useCallback(async () => {
		isAnalyzing.current = true;
		reduxDispatch(resetStates());
		if (websocketRef.current) {
			websocketRef.current.close();
			websocketRef.current = null;
		}

		if (mediaStreamRef.current) {
			for (const track of mediaStreamRef.current.getTracks()) {
				track.stop();
			}

			mediaStreamRef.current = null;
		}
		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}
	}, []);

	const pauseConversation = () => {
		isPausedRef.current = true;
		reduxDispatch(setPaused(true));
	};

	const resumeConversation = () => {
		isPausedRef.current = false;
		reduxDispatch(setPaused(false));
	};

	return {
		startConversation,
		stopConversation,
		isConnecting,
		retryCount,
		currentMessage,
		conversationList,
		formCompleted,
		formResponse,
		pauseConversation,
		resumeConversation,
		audioStream: mediaStreamRef?.current,
		agentSpeaking,
	};
};

export default useConversation;
