import { jwtDecode } from "jwt-decode";
import _ from "lodash";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { useEffect, useRef, useState } from "react";
import { HTTPAidaBaseService } from "./../adapters/http";

const useVoiceRecognizer = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [isStopped, setIsStopped] = useState(true);
	const [recordingTime, setRecordingTime] = useState(0);
	const [transcription, setTranscription] = useState([]);
	const [liveTranscription, setLiveTranscription] = useState("");

	const recognizerRef = useRef(null);
	const timerRef = useRef(null);

	useEffect(() => {
		if (isRecording && !isPaused) {
			timerRef.current = setInterval(() => {
				setRecordingTime((prevTime) => prevTime + 1);
			}, 1000);
		} else {
			clearInterval(timerRef.current);
		}
		return () => clearInterval(timerRef.current);
	}, [isRecording, isPaused]);

	const startRecording = async () => {
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
			recognizerRef.current = new sdk.SpeechRecognizer(
				speechConfig,
				audioConfig,
			);

			recognizerRef.current.recognizing = (_s, e) => {
				if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
					setLiveTranscription(e.result.text);
				}
			};

			recognizerRef.current.recognized = (_s, e) => {
				if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
					setTranscription((prev) => [
						...prev,
						{ id: _.uniqueId(), text: e.result.text, isFinal: true },
					]);
				} else if (e.result.reason === sdk.ResultReason.NoMatch) {
					console.error("No speech could be recognized.");
				}
			};

			recognizerRef.current.canceled = (_s, e) => {
				console.error(`Recognition canceled: ${e.reason}`);
				resetStates();
			};

			recognizerRef.current.startContinuousRecognitionAsync(
				() => {
					setIsRecording(true);
					setIsStopped(false);
				},
				(err) => {
					console.error(err.message);
					setIsRecording(false);
					setIsStopped(true);
				},
			);
		} catch (err) {
			console.error(err.message);
		}
	};

	const pauseRecording = () => {
		if (recognizerRef.current) {
			recognizerRef.current.stopContinuousRecognitionAsync(
				() => {
					setIsPaused(true);
					setLiveTranscription("");
				},
				(err) => console.error(err.message),
			);
		}
	};

	const resumeRecording = async () => {
		if (recognizerRef.current && isPaused) {
			recognizerRef.current.startContinuousRecognitionAsync(
				() => setIsPaused(false),
				(err) => console.error(err.message),
			);
		}
	};

	const stopRecording = async () => {
		if (recognizerRef.current) {
			await new Promise((resolve, reject) => {
				recognizerRef.current.stopContinuousRecognitionAsync(
					() => {
						resetStates();
						setIsStopped(true);
						resolve();
					},
					(err) => {
						console.error(err.message);
						setIsStopped(true);
						reject(err);
					},
				);
			});
		} else {
			resetStates();
			setIsStopped(true);
		}
	};

	const resetStates = () => {
		setIsRecording(false);
		setIsPaused(false);
		setRecordingTime(0);
		setTranscription([]);
		setLiveTranscription("");
	};

	return {
		isRecording,
		isPaused,
		isStopped,
		recordingTime,
		transcription,
		liveTranscription,
		startRecording,
		pauseRecording,
		resumeRecording,
		stopRecording,
		setLiveTranscription,
	};
};

export default useVoiceRecognizer;

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
