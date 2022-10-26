import React, { useEffect, useRef } from 'react';
import Image from '../Image';

const PreviewMediaZoom = ({ src }) => {
	const zoomView = useRef();

	useEffect(() => {
		let debounceTimer;

		const handleMouseMove = (e) => {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			let currentTarget = e.currentTarget;
			let currentX = e.x;
			let currentY = e.y;

			debounceTimer = setTimeout(function () {
				let targetX = currentTarget.offsetWidth / 2 - currentX;
				if (currentX > currentTarget.offsetWidth) {
					targetX = targetX * -1;
				}

				let targetY = currentTarget.offsetHeight / 2 - currentY;
				if (currentY > currentTarget.offsetHeight) {
					targetY = targetY * -1;
				}

				zoomView.current.style.transform =
					'translateX(' +
					targetX +
					'px) translateY(' +
					targetY +
					'px) scale(2)';
			}, 5);
		};

		zoomView.current.addEventListener('mousemove', handleMouseMove);

		return () => {
			zoomView.current.removeEventListener('mousemove', handleMouseMove);
		};
	}, []);

	return (
		<div className="app__mediaPreview__zoom" ref={zoomView}>
			<Image src={src} alt="Preview" />
		</div>
	);
};

export default PreviewMediaZoom;
