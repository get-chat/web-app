import * as React from 'react';

/**
 * Drop-in for MUI's ClickAwayListener: calls `onClickAway` on a click or tap
 * outside its single child. Like MUI's, clicks inside the child's React tree
 * count as inside even when they land in a portal (menus, popovers), and the
 * click that mounts it is ignored.
 */
function ClickAwayListener({
	children,
	onClickAway,
}: {
	children: React.ReactElement<
		React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
	>;
	onClickAway: (event: MouseEvent | TouchEvent) => void;
}) {
	const nodeRef = React.useRef<HTMLElement | null>(null);
	const isInsideReactTree = React.useRef(false);
	const isActive = React.useRef(false);
	const handler = React.useRef(onClickAway);
	handler.current = onClickAway;

	React.useEffect(() => {
		// Skip the event that rendered us, as MUI does
		const timer = window.setTimeout(() => {
			isActive.current = true;
		}, 0);

		const listener = (event: MouseEvent | TouchEvent) => {
			const insideReactTree = isInsideReactTree.current;
			isInsideReactTree.current = false;

			const node = nodeRef.current;
			if (!isActive.current || !node) return;
			if (insideReactTree || event.composedPath().includes(node)) return;

			handler.current(event);
		};

		document.addEventListener('click', listener);
		document.addEventListener('touchend', listener);
		return () => {
			window.clearTimeout(timer);
			isActive.current = false;
			document.removeEventListener('click', listener);
			document.removeEventListener('touchend', listener);
		};
	}, []);

	const markInside = () => {
		isInsideReactTree.current = true;
	};

	const childProps = children.props;
	// React 19 passes `ref` as a prop
	const childRef = childProps.ref;

	return React.cloneElement(children, {
		ref: (node: HTMLElement | null) => {
			nodeRef.current = node;
			if (typeof childRef === 'function') childRef(node);
			else if (childRef) {
				(childRef as React.MutableRefObject<HTMLElement | null>).current = node;
			}
		},
		onClick: (event: React.MouseEvent<HTMLElement>) => {
			markInside();
			childProps.onClick?.(event);
		},
		onTouchEnd: (event: React.TouchEvent<HTMLElement>) => {
			markInside();
			childProps.onTouchEnd?.(event);
		},
	});
}

export { ClickAwayListener };
