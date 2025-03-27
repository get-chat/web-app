import React, { useEffect, useState } from 'react';
import { Checkbox, ListItem } from '@mui/material';
import '../../../styles/SelectableChatTag.css';
import SellIcon from '@mui/icons-material/Sell';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import { Tag } from '@src/types/tags';

interface Props {
	data: Tag;
}

const SelectableChatTag: React.FC<Props> = ({ data }) => {
	const [isSelected, setSelected] = useState(false);
	const { selectedTags } = useAppSelector((state) => state.UI);
	const dispatch = useAppDispatch();

	useEffect(() => {
		setSelected(selectedTags.includes(data.id));
	}, [selectedTags]);

	const handleClick = () => {
		let prevState = [...selectedTags];
		if (prevState.includes(data.id)) {
			prevState = prevState.filter((arrayItem) => arrayItem !== data.id);
		} else {
			prevState.push(data.id);
		}

		dispatch(
			setState({
				selectedTags: prevState,
			})
		);
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
					<SellIcon style={{ fill: data.web_inbox_color }} />
					{data.name}
				</div>
			</div>
		</ListItem>
	);
};

export default SelectableChatTag;
