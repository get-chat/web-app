import React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@src/components/ui/spinner';
import { cn } from '@src/lib/utils';

interface Props {
	className?: string;
}

/**
 * The floating pill shown while a list loads more items (older messages,
 * more chats): a small spinner and a label on a raised white pill. Position
 * it from the outside.
 */
const LoadingMoreIndicator: React.FC<Props> = ({ className }) => {
	const { t } = useTranslation();

	return (
		<div
			role="status"
			className={cn(
				'inline-flex h-8 items-center gap-2 rounded-full bg-white py-1.5 pr-3.5 pl-2.5 text-[13px] font-medium text-muted-foreground shadow-md ring-1 ring-ink/5',
				className
			)}
		>
			<Spinner size={16} className="text-primary" aria-hidden />
			{t('Loading')}
		</div>
	);
};

export default LoadingMoreIndicator;
