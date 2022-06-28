import React, { useEffect, useState } from 'react';
import { Checkbox, ListItem } from '@material-ui/core';
import LabelIcon from '@material-ui/icons/Label';
import '../../../styles/SelectableChatTag.css';

function SelectableChatTag(props) {
	const [isSelected, setSelected] = useState(false);

	useEffect(() => {
		setSelected(props.selectedTags.includes(props.data.id));
	}, [props.selectedTags]);

	const handleClick = () => {
		props.setSelectedTags((prevState) => {
			if (prevState.includes(props.data.id)) {
				prevState = prevState.filter(
					(arrayItem) => arrayItem !== props.data.id
				);
			} else {
				prevState.push(props.data.id);
			}

			return [...prevState];
		});
	};

	return (
		<ListItem className="sidebarTagListItem" button onClick={handleClick}>
			<div className={'sidebarTag ' + (isSelected ? 'isSelected ' : '')}>
				<Checkbox
					className="sidebarTag__selection"
					checked={isSelected}
					color="primary"
				/>
				<div className="sidebarTag__selection__tag">
					<LabelIcon style={{ fill: props.data.web_inbox_color }} />
					{props.data.name}
				</div>
			</div>
		</ListItem>
	);
}

export default SelectableChatTag;
