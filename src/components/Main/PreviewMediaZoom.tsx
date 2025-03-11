import React, { useEffect, useRef } from 'react';
import Image from '../Image';

interface Props {
	src: string;
	onClick: () => void;
}

const PreviewMediaZoom: React.FC<Props> = ({ src, onClick }) => {
	const zoomView = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let currentZoomView = zoomView.current;

		let debounceTimer: NodeJS.Timeout;

		const move = (
			currentTarget: HTMLElement,
			currentX: number,
			currentY: number
		) => {
			currentX = Math.max(0, Math.min(currentTarget.offsetWidth, currentX));
			let targetX = currentTarget.offsetWidth / 2 - currentX;

			currentY = Math.max(0, Math.min(currentTarget.offsetHeight, currentY));
			let targetY = currentTarget.offsetHeight / 2 - currentY;

			if (currentZoomView) {
				currentZoomView.style.transform =
					'translateX(' +
					targetX +
					'px) translateY(' +
					targetY +
					'px) scale(2)';
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			let _currentTarget = e.currentTarget as HTMLElement;
			let _currentX = e.clientX;
			let _currentY = e.clientY;

			debounceTimer = setTimeout(function () {
				move(_currentTarget, _currentX, _currentY);
			}, 5);
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			let _currentTarget = e.currentTarget as HTMLElement;
			let _currentX = _currentTarget.offsetWidth - e.changedTouches[0].clientX;
			let _currentY = _currentTarget.offsetHeight - e.changedTouches[0].clientY;

			debounceTimer = setTimeout(function () {
				move(_currentTarget, _currentX, _currentY);
			}, 5);
		};

		currentZoomView?.addEventListener('mousemove', handleMouseMove);
		currentZoomView?.addEventListener('touchmove', handleTouchMove);

		return () => {
			currentZoomView?.removeEventListener('mousemove', handleMouseMove);
			currentZoomView?.removeEventListener('touchmove', handleTouchMove);
		};
	}, [zoomView]);

	return (
		<div className="app__mediaPreview__zoom" ref={zoomView} onClick={onClick}>
			<Image src={src} alt="Preview" />
		</div>
	);
};

export default PreviewMediaZoom;
