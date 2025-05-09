import { QuickActionType } from '@src/components/QuickActionItem/QuickActionType';
import React, { memo } from 'react';
import * as Styled from './QuickActionItem.styles';

export type Props = {
	item: QuickActionType;
	isSelected: boolean;
	itemProps: {};
};

const QuickActionItem: React.FC<Props> = ({ item, isSelected, itemProps }) => {
	return (
		<Styled.Container $isSelected={isSelected} {...itemProps}>
			<div>
				{item.isStatic ? (
					<Styled.StaticCommandIcon className={Styled.CommandIcon} />
				) : (
					<Styled.DynamicCommandIcon className={Styled.CommandIcon} />
				)}
				<Styled.Command $isStatic={item.isStatic} className="bold">
					{item.isStatic ? item.command : item.command.substring(1)}
				</Styled.Command>{' '}
				{item.parameterHint} {item.parameters?.join(' ')}
			</div>
			<Styled.Description>{item.description}</Styled.Description>
		</Styled.Container>
	);
};

export default memo(QuickActionItem);
