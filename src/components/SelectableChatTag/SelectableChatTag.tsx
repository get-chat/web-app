import React, { useEffect, useState } from 'react';
import SellIcon from '@src/components/icons/Sell';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import { Tag } from '@src/types/tags';
import { Checkbox } from '@src/components/ui/checkbox';
import { cn } from '@src/lib/utils';

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
		<div
			className="relative flex w-full items-center p-0 text-left"
			onClick={handleClick}
		>
			<div
				className={cn(
					'flex flex-1 items-center px-3.75 py-1.25',
					isSelected ? 'bg-[#d9efec]' : 'bg-inherit'
				)}
			>
				{/* m-3: the room MUI's 42px checkbox took around its box */}
				<Checkbox checked={isSelected} color="primary" className="m-3" />
				<div className="ml-2.5 flex flex-1 truncate font-semibold">
					<SellIcon className="mr-2" style={{ fill: data.web_inbox_color }} />
					{data.name}
				</div>
			</div>
		</div>
	);
};

export default SelectableChatTag;
