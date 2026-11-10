import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@src/components/ui/badge';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@src/components/ui/tooltip';

interface Props {
	size?: 'sm' | 'default';
	// Show the explanation under the badge rather than in a tooltip, which
	// touch screens cannot open
	isDescribed?: boolean;
}

/**
 * Marks a contact who stopped marketing messages from the business in
 * WhatsApp (`Person.marketing_opt_out`).
 */
const MarketingOptOutBadge: React.FC<Props> = ({
	size = 'sm',
	isDescribed = false,
}) => {
	const { t } = useTranslation();

	const badge = (
		<Badge color="warning" size={size} data-test-id="marketing-opt-out-badge">
			{t('No marketing')}
		</Badge>
	);
	const description = t(
		'This customer stopped marketing messages from your business in WhatsApp. Marketing templates are not delivered to them; other messages still are.'
	);

	if (isDescribed) {
		return (
			<div className="flex flex-col items-center gap-1.5">
				{badge}
				<p className="m-0 max-w-[320px] text-center text-[13px] text-ink/60">
					{description}
				</p>
			</div>
		);
	}

	return (
		<Tooltip disableHoverableContent>
			<TooltipTrigger asChild>{badge}</TooltipTrigger>
			<TooltipContent className="max-w-[280px] whitespace-normal">
				{description}
			</TooltipContent>
		</Tooltip>
	);
};

export default MarketingOptOutBadge;
