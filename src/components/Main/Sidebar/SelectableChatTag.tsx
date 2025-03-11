import React, { useEffect, useState } from 'react';
import { Checkbox, ListItem } from '@mui/material';
import '../../../styles/SelectableChatTag.css';
import SellIcon from '@mui/icons-material/Sell';
import TagModel from '@src/api/models/TagModel';

interface Props {
	data: TagModel;
	selectedTags: number[];
	setSelectedTags: (data: any) => void;
}

const SelectableChatTag: React.FC<Props> = ({
	data,
	selectedTags,
	setSelectedTags,
}) => {
	const [isSelected, setSelected] = useState(false);

	useEffect(() => {
		setSelected(selectedTags.includes(data.id));
	}, [selectedTags]);

	const handleClick = () => {
		setSelectedTags((prevState: number[]) => {
			if (prevState.includes(data.id)) {
				prevState = prevState.filter((arrayItem) => arrayItem !== data.id);
			} else {
				prevState.push(data.id);
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
					<SellIcon style={{ fill: data.color }} />
					{data.name}
				</div>
			</div>
		</ListItem>
	);
};

export default SelectableChatTag;
