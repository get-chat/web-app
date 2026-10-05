import React, { useEffect, useState } from 'react';
import SellIcon from '@mui/icons-material/Sell';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import { Tag } from '@src/types/tags';
import * as Styled from './SelectableChatTag.styles';
import { Checkbox } from '@src/components/ui/checkbox';

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
		<Styled.StyledListItem onClick={handleClick}>
			<Styled.TagContainer $isSelected={isSelected}>
				{/* m-3: the room MUI's 42px checkbox took around its box */}
				<Checkbox checked={isSelected} color="primary" className="m-3" />
				<Styled.TagContent>
					<SellIcon style={{ fill: data.web_inbox_color }} />
					{data.name}
				</Styled.TagContent>
			</Styled.TagContainer>
		</Styled.StyledListItem>
	);
};

export default SelectableChatTag;
