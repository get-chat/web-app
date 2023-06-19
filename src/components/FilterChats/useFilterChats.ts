import { MouseEvent, useState } from 'react';

interface Props {
	showChatTagsList: () => void;
}

const useFilterChats = ({ showChatTagsList }: Props) => {
	const [menuAnchorEl, setMenuAnchorEl] = useState<Element>();

	const displayMenu = (event: MouseEvent) => {
		if (event.currentTarget instanceof Element) {
			setMenuAnchorEl(event.currentTarget);
		}
	};

	const hideMenu = () => {
		setMenuAnchorEl(undefined);
	};

	const showTags = () => {
		showChatTagsList();
		hideMenu();
	};

	return {
		displayMenu,
		hideMenu,
		menuAnchorEl,
		showTags,
	};
};

export default useFilterChats;
