import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

let videoBoxEl, videoEl;

export const setVideoBoxEl = el => (videoBoxEl = el);

export const setVideoEl = el => (videoEl = el);

export const startVideo = async () => {
	if (!videoEl) throw new Error('Video element needs to be set.');

	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false
		});
		videoEl.srcObject = stream;
	} catch (e) {
		console.error(e);
	}
};

export const stopVideo = async () => {
	const stream = videoEl.srcObject;
	const tracks = stream.getTracks();

	tracks.forEach(function(track) {
		track.stop();
	});

	videoEl.srcObject = null;
};

const loadModels = () => {
	return Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
		faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
		faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
		faceapi.nets.faceExpressionNet.loadFromUri('/models')
	]);
};

const init = async () => {
	await loadModels();
	await startVideo();
};

const startDetection = handleDetections => {
	if (!videoEl) throw new Error('Video element needs to be set.');

	return setInterval(async () => {
		const detections = await faceapi
			.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceExpressions();

		handleDetections(detections);
	}, 100);
};

// const startDetectionWithRendering = handleDetections => {
// 	if (!videoEl) throw new Error('Video element needs to be set.');
// 	if (!videoBoxEl) throw new Error('Video box element needs to be set.');

// 	const canvas = faceapi.createCanvasFromMedia(videoEl);
// 	videoBoxEl.appendChild(canvas);
// 	const displaySize = { width: videoEl.width, height: videoEl.height };
// 	faceapi.matchDimensions(canvas, displaySize);

// 	return setInterval(async () => {
// 		const detections = await faceapi
// 			.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
// 			.withFaceLandmarks()
// 			.withFaceExpressions();

// 		handleDetections(detections);

// 		const resizedDetections = faceapi.resizeResults(
// 			detections,
// 			displaySize
// 		);
// 		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
// 		faceapi.draw.drawDetections(canvas, resizedDetections);
// 		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
// 		faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
// 	}, 100);
// };

const stopDetection = intervalId => {
	if (!intervalId) return console.warn('No interval id found.');

	clearInterval(intervalId);
};

export const useFaceDetection = () => {
	const videoBoxRef = useRef(null);
	const videoRef = useRef(null);
	const [isVideoReady, setIsVideoReady] = useState(false);
	const [detections, setDetections] = useState(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		setVideoEl(videoRef.current);
		setVideoBoxEl(videoBoxRef.current);
		init().then(() => setIsVideoReady(true));
	}, []);

	useEffect(() => {
		setIsReady(isVideoReady && detections);
	}, [isVideoReady, detections]);

	const FaceDetectionVideo = useCallback(props => {
		let intervalId;

		const onVideoPlay = () => {
			const handleDetections = detections => {
				console.log({ detections });
				setDetections(detections);
			};
			intervalId = startDetection(handleDetections);
		};

		const onVideoPause = () => {
			stopDetection(intervalId);
			stopVideo();
		};
		return (
			<div ref={videoBoxRef} {...props.videoBoxProps}>
				<video
					onPlay={onVideoPlay}
					onPause={onVideoPause}
					ref={videoRef}
					autoPlay
					muted
					{...props.videoProps}
				/>
			</div>
		);
	}, []);

	return {
		isReady,
		isVideoReady,
		videoBoxEl: videoBoxRef.current,
		videoEl: videoRef.current,
		detections,
		FaceDetectionVideo
	};
};
