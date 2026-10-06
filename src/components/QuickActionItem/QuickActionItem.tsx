import { QuickActionType } from '@src/components/QuickActionItem/QuickActionType';
import React, { memo } from 'react';
import KeyboardCommandKeyIcon from '@src/components/icons/KeyboardCommandKey';
import BoltIcon from '@src/components/icons/Bolt';
import { cn } from '@src/lib/utils';

const iconClassName = 'mr-1.25 size-5!';

export type Props = {
	item: QuickActionType;
	isSelected: boolean;
	itemProps: {};
};

const QuickActionItem: React.FC<Props> = ({ item, isSelected, itemProps }) => {
	return (
		<div
			className={cn(
				'flex cursor-pointer flex-col px-3.75 py-1.25 text-[14px]',
				isSelected && 'bg-gray-lighter'
			)}
			{...itemProps}
		>
			<div>
				{item.isStatic ? (
					<KeyboardCommandKeyIcon
						className={cn(iconClassName, 'text-[#50da26]!')}
					/>
				) : (
					<BoltIcon className={cn(iconClassName, 'text-[#ffbe1b]!')} />
				)}
				<span
					className={cn(
						'font-semibold overflow-hidden',
						item.isStatic &&
							'rounded-[4px] border-2 border-white bg-gray-light px-1 py-0.5'
					)}
				>
					{item.isStatic ? item.command : item.command.substring(1)}
				</span>{' '}
				{item.parameterHint} {item.parameters?.join(' ')}
			</div>
			<div className="mt-px ml-6.25 text-[12px] whitespace-pre-line text-ink/60">
				{item.description}
			</div>
		</div>
	);
};

export default memo(QuickActionItem);
