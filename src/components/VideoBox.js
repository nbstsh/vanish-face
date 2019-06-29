import React, { useState, useEffect } from 'react';
import style from './VideoBox.module.scss';

import { useFaceDetection } from '../utils/face-detectoin';
import startThanosEffect, { videoToImage } from '../utils/thanos-effect';
import TweenMax from 'gsap/TweenMax';

const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 560;

const VideoBox = () => {
	const [needVanish, setNeedVanish] = useState(false);
	const [isVanished, setIsVanished] = useState(false);
	const {
		isReady,
		videoEl,
		videoBoxEl,
		detections,
		FaceDetectionVideo
	} = useFaceDetection();

	useEffect(() => {
		if (!detections || !detections.length) return;

		const { expressions } = detections[0];
		if (!expressions) return;

		const needVanish = expressions.happy > 0.9;
		setNeedVanish(needVanish);
	}, [detections]);

	useEffect(() => {
		if (!needVanish) return;

		videoEl.pause();
		TweenMax.to(videoEl, 0.5, {
			opacity: 0
		});

		const imageEl = videoToImage(videoEl);
		videoBoxEl.append(imageEl);
		imageEl.onload = () => {
			startThanosEffect(imageEl, videoBoxEl).then(() => {
				setIsVanished(true);
			});
		};
	}, [videoBoxEl, videoEl, needVanish]);

	const videoBoxProps = {
		className: style.box,
		style: {
			opacity: isReady ? 1 : 0,
			// set custom variable in VidoeBox.module.scss
			'--width': VIDEO_WIDTH + 'px',
			'--height': VIDEO_HEIGHT + 'px'
		}
	};

	const videoProps = {
		className: style.video,
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT
	};

	return (
		<div className={style.container}>
			{!isReady && <h1>Loading ...</h1>}
			{!isVanished && (
				<FaceDetectionVideo
					videoBoxProps={videoBoxProps}
					videoProps={videoProps}
				/>
			)}
		</div>
	);
};

export default VideoBox;
