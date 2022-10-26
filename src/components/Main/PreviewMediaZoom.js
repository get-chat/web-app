import React, { useEffect, useRef } from 'react';
import Image from '../Image';

const PreviewMediaZoom = ({ src, onClick }) => {
	const zoomView = useRef();

	useEffect(() => {
		let debounceTimer;

		const move = (currentTarget, currentX, currentY) => {
			if (currentX < 0) currentX = 0;
			if (currentX > currentTarget.offsetWidth)
				currentX = currentTarget.offsetWidth;
			let targetX = currentTarget.offsetWidth / 2 - currentX;
			if (currentX > currentTarget.offsetWidth) {
				targetX = targetX * -1;
			}

			if (currentY < 0) currentY = 0;
			if (currentY > currentTarget.offsetHeight)
				currentY = currentTarget.offsetHeight;
			let targetY = currentTarget.offsetHeight / 2 - currentY;
			if (currentY > currentTarget.offsetHeight) {
				targetY = targetY * -1;
			}

			zoomView.current.style.transform =
				'translateX(' + targetX + 'px) translateY(' + targetY + 'px) scale(2)';
		};

		const handleMouseMove = (e) => {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			let _currentTarget = e.currentTarget;
			let _currentX = e.x;
			let _currentY = e.y;

			debounceTimer = setTimeout(function () {
				move(_currentTarget, _currentX, _currentY);
			}, 5);
		};

		const handleTouchMove = (e) => {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			let _currentTarget = e.currentTarget;
			let _currentX = e.changedTouches[0].clientX;
			let _currentY = e.changedTouches[0].clientY;

			debounceTimer = setTimeout(function () {
				move(_currentTarget, _currentX, _currentY);
			}, 5);
		};

		zoomView.current.addEventListener('mousemove', handleMouseMove);
		zoomView.current.addEventListener('touchmove', handleTouchMove);

		return () => {
			zoomView.current.removeEventListener('mousemove', handleMouseMove);
			zoomView.current.removeEventListener('touchmove', handleTouchMove);
		};
	}, [zoomView]);

	return (
		<div className="app__mediaPreview__zoom" ref={zoomView} onClick={onClick}>
			<Image src={src} alt="Preview" />
		</div>
	);
};

export default PreviewMediaZoom;
