import { TweenMax } from 'gsap/TweenMax';

const NUMBER_OF_CANVASES = 35;
const IMAGE_WIDTH = 720;
const IMAGE_HEIGHT = 560;

const generateRandomInt = max => {
	return Math.floor(Math.random() * Math.floor(max));
};

const generateCtx = () => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	return { canvas, ctx };
};

const generateTransparentImageData = imageData => {
	return generateCtx().ctx.createImageData(imageData);
};

const retrieveImageData = imageEl => {
	const { width, height } = imageEl;
	const { canvas, ctx } = generateCtx();
	canvas.width = width;
	canvas.height = height;
	ctx.drawImage(imageEl, 0, 0, width, height);
	return ctx.getImageData(0, 0, width, height);
};

const copyRGBAInUint8ClampedArray = (dataFrom, dataTo, startIndex) => {
	dataTo[startIndex] = dataFrom[startIndex];
	dataTo[startIndex + 1] = dataFrom[startIndex + 1];
	dataTo[startIndex + 2] = dataFrom[startIndex + 2];
	dataTo[startIndex + 3] = dataFrom[startIndex + 3];
};

const distributePixelsRandomly = (
	imageData,
	denominator = NUMBER_OF_CANVASES
) => {
	const imageDataArray = [...Array(denominator)].map(() =>
		generateTransparentImageData(imageData)
	);

	const dataFrom = imageData.data;
	for (let i = 0; i < dataFrom.length; i += 4) {
		const targetImageData =
			imageDataArray[generateRandomInt(denominator - 1)];
		copyRGBAInUint8ClampedArray(dataFrom, targetImageData.data, i);
	}

	return imageDataArray;
};

const imageDataToCanvas = imageData => {
	const { canvas, ctx } = generateCtx();
	canvas.width = IMAGE_WIDTH;
	canvas.height = IMAGE_HEIGHT;
	ctx.putImageData(imageData, 0, 0);
	return canvas;
};

const dissapear = canvasElements =>
	new Promise((resolve, reject) => {
		canvasElements.forEach((canvas, i) => {
			canvas.classList.add('blur');
			const values = [0, 100, -100];
			const onComplete = i !== canvasElements.length - 1 ? null : resolve;

			TweenMax.to(canvas, 1, {
				opacity: 0,
				scale: i > canvasElements.length / 2 ? '2' : '1',
				rotation: values[generateRandomInt(2)] * 0.1,
				x: values[generateRandomInt(2)],
				y: values[generateRandomInt(2)],
				delay: i * 0.1,
				onComplete
			});
		});
	});

const startThanosEffect = async (imageEl, imageBoxEl) => {
	// fade out image element
	TweenMax.to(imageEl, 0.5, { opacity: 0 });

	// generate canvas elements which contain distributed pixels of image
	const imageData = retrieveImageData(imageEl);
	const imageDataArray = distributePixelsRandomly(imageData);
	const canvasElements = imageDataArray.map(imageDataToCanvas);

	// render canva elements
	canvasElements.forEach(canvas => {
		imageBoxEl.appendChild(canvas);
	});

	await dissapear(canvasElements);
};

// for test purpose
export const renderImageDataArray = imageDataArray => {
	imageDataArray.forEach(imageData => {
		const { canvas, ctx } = generateCtx();
		canvas.width = IMAGE_WIDTH;
		canvas.height = IMAGE_HEIGHT;
		ctx.putImageData(imageData, 0, 0);
		document.body.appendChild(canvas);
	});
};

export const videoToImage = videoEl => {
	const { width, height } = videoEl;
	const { canvas, ctx } = generateCtx();
	canvas.width = width;
	canvas.height = height;
	ctx.drawImage(videoEl, 0, 0, width, height);
	const dataUrl = canvas.toDataURL();

	const imageEl = new Image(width, height);
	imageEl.src = dataUrl;

	return imageEl;
};

export default startThanosEffect;
