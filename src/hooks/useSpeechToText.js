import { jwtDecode } from "jwt-decode";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import nosleep from "nosleep.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stopVisualization } from "../components/CaseFlowComponents/data";
import {
	addTranscription,
	resetStates,
	setPaused,
	setRecording,
	setRecordingTime,
	setStopped,
} from "../redux/slices/speechSlice";
import { HTTPAidaBaseService } from "./../adapters/http";

const useSpeechToText = () => {
	const reduxDispatch = useDispatch();
	const { isRecording, isPaused, isStopped, recordingTime, transcription } =
		useSelector((state) => state.speech);

	const recognizerRef = useRef(null);
	const timerRef = useRef(null);
	const liveTranscriptionRef = useRef("");
	const [audioStream, setAudioStream] = useState(null);
	const [wakeLock, setWakeLock] = useState(null);
	const noSleep = useRef(new nosleep());
	const [hasPermission, setHasPermission] = useState(false);
	const [openAlert, setOpenAlert] = useState(false);

	const enableWakeLock = async () => {
		try {
			if ("wakeLock" in navigator) {
				const lock = await navigator.wakeLock.request("screen");
				setWakeLock(lock);
				lock.addEventListener("release", () => {});
			} else {
				noSleep.current.enable();
			}
		} catch (err) {
			console.error("Failed to enable wake lock:", err);
		}
	};

	const disableWakeLock = () => {
		if (wakeLock) {
			wakeLock.release();
			setWakeLock(null);
		} else {
			noSleep.current.disable();
		}
	};

	useEffect(() => {
		if (isRecording && !isPaused) {
			timerRef.current = setInterval(() => {
				reduxDispatch(setRecordingTime(recordingTime + 1));
			}, 1000);
			enableWakeLock();
		} else {
			clearInterval(timerRef.current);
			disableWakeLock();
		}
		return () => {
			clearInterval(timerRef.current);
			disableWakeLock();
		};
	}, [isRecording, isPaused, recordingTime, reduxDispatch]);

	useEffect(() => {
		const refreshToken = async () => {
			try {
				const { newToken } = await fetchTokenAndRegion();
				if (newToken && recognizerRef.current) {
					recognizerRef.current.authorizationToken = newToken;
				} else {
					console.error(
						"Failed to refresh token or recognizer not initialized",
					);
				}
			} catch (error) {
				console.error("Error refreshing token:", error);
			}
		};

		refreshToken();
		const tokenRefreshInterval = setInterval(refreshToken, 7 * 60 * 1000);

		return () => {
			clearInterval(tokenRefreshInterval);
		};
	}, [recognizerRef]);

	const startRecording = useCallback(async () => {
		const permission = await checkMicrophoneSupport();

		if (!permission) {
			setOpenAlert(true);
			return;
		}
		try {
			const { newToken, region } = await fetchTokenAndRegion();
			if (!newToken || !region) {
				throw new Error("Token or region is missing");
			}

			const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
				newToken,
				region,
			);
			const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
			recognizerRef.current = new sdk.ConversationTranscriber(
				speechConfig,
				audioConfig,
			);

			// Use the modern mediaDevices.getUserMedia API
			if (navigator.mediaDevices?.getUserMedia) {
				try {
					const stream = await navigator.mediaDevices.getUserMedia({
						audio: true,
					});
					setAudioStream(stream);
				} catch (err) {
					console.error("Could not get user media", err);
				}
			} else {
				console.error("getUserMedia is not supported in this browser");
			}

			recognizerRef.current.transcribing = (_s, e) => {
				if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
					liveTranscriptionRef.current = e.result.text;
				}
			};

			recognizerRef.current.transcribed = (_s, e) => {
				if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
					reduxDispatch(
						addTranscription({
							speakerId: e.result.speakerId,
							speakerText: e.result.text,
						}),
					);
				} else if (e.result.reason === sdk.ResultReason.NoMatch) {
					console.error("No speech could be recognized.");
				}
			};

			recognizerRef.current.canceled = (_s, e) => {
				console.error(`Recognition canceled: ${e.reason}`);
				reduxDispatch(resetStates());
				liveTranscriptionRef.current = "";
			};

			recognizerRef.current.startTranscribingAsync(
				() => {
					reduxDispatch(setRecording(true));
				},
				(err) => {
					console.error(err.message);
					reduxDispatch(setRecording(false));
				},
			);
		} catch (err) {
			console.error(err.message);
		}
	}, [
		recognizerRef,
		liveTranscriptionRef,
		setOpenAlert,
		setAudioStream,
		reduxDispatch,
	]);

	const pauseRecording = useCallback(() => {
		if (recognizerRef.current) {
			recognizerRef.current.stopTranscribingAsync(
				() => {
					reduxDispatch(setPaused(true));
					liveTranscriptionRef.current = "";
				},
				(err) => console.error(err.message),
			);
		}
	}, [recognizerRef, reduxDispatch]);

	const resumeRecording = useCallback(() => {
		if (recognizerRef.current && isPaused) {
			recognizerRef.current.startTranscribingAsync(
				() => reduxDispatch(setPaused(false)),
				(err) => console.error(err.message),
			);
		}
	}, [isPaused, recognizerRef, reduxDispatch]);

	function stopAzureRecognitionAsync(recognizer) {
		return new Promise((resolve, reject) => {
			recognizer.stopTranscribingAsync(
				() => {
					resolve();
				},
				(error) => {
					reject(error);
				},
			);
		});
	}

	const stopRecording = useCallback(async () => {
		try {
			// If the user doesn't have permission to record, terminate.
			if (!hasPermission) {
				return;
			}

			// If we have an active Azure Speech recognizer
			if (recognizerRef.current) {
				try {
					// Await the stop so it completes fully before proceeding.
					await stopAzureRecognitionAsync(recognizerRef.current);
				} catch (err) {
					// If stopping fails, we still want to proceed with cleanup
					console.error("Error stopping Azure Speech recognizer:", err);
				}
			}

			// Now stop the visualization
			stopVisualization();

			// Kill all audio tracks if an audioStream is present
			if (audioStream) {
				const tracks = audioStream.getTracks();
				for (const track of tracks) {
					track.stop();
				}
			}

			reduxDispatch(resetStates());
			liveTranscriptionRef.current = "";
			reduxDispatch(setStopped(true));
		} catch (error) {
			console.error("Error stopping recording", error);
		}
	}, [
		hasPermission,
		recognizerRef,
		stopVisualization,
		audioStream,
		reduxDispatch,
		liveTranscriptionRef,
	]);

	const checkMicrophoneSupport = async () => {
		if (!navigator?.mediaDevices || !navigator?.mediaDevices?.getUserMedia) {
			return;
		}

		try {
			const stream = await navigator?.mediaDevices?.getUserMedia({
				audio: true,
			});
			setHasPermission(true);
			if (stream) {
				const tracks = stream.getTracks();
				for (const track of tracks) {
					track.stop();
				}
			}
			return true;
		} catch (_error) {
			setHasPermission(false);
			return false;
		}
	};

	useEffect(() => {
		const handleMicrophonePermissionChange = async () => {
			const permission = await checkMicrophoneSupport();
			setHasPermission(permission);
			if (!permission) {
				stopRecording();
			}
		};

		navigator?.mediaDevices?.addEventListener(
			"devicechange",
			handleMicrophonePermissionChange,
		);

		return () => {
			navigator?.mediaDevices?.removeEventListener(
				"devicechange",
				handleMicrophonePermissionChange,
			);
			reduxDispatch(setStopped(false));
		};
	}, []);

	return {
		isRecording,
		isPaused,
		isStopped,
		recordingTime,
		transcription,
		liveTranscriptionRef,
		startRecording,
		pauseRecording,
		resumeRecording,
		stopRecording,
		audioStream,
		openAlert,
		setOpenAlert,
	};
};

export default useSpeechToText;

export const fetchTokenAndRegion = async () => {
	try {
		const token = localStorage.getItem("jwtToken");
		if (!token) throw new Error("No token found");
		const jwtPayload = jwtDecode(token);
		const tenantId = jwtPayload?.firebase?.tenant;
		const response = await HTTPAidaBaseService.get(
			`/${tenantId}/get-stt-access-token`,
		);
		const newToken = response.data;
		const region = process.env.REACT_APP_SERVICE_REGION;
		return { newToken, region };
	} catch (error) {
		console.error("Failed to refresh token", error);
		return { newToken: null, region: null };
	}
};
