import React from 'react';
import style from './App.module.scss';
import VideoBox from './components/VideoBox';

function App() {
	return (
		<div className={style.app}>
			<VideoBox />
		</div>
	);
}

export default App;
