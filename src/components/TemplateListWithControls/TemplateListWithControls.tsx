import React, { forwardRef } from 'react';
import { Alert } from '@src/components/ui/alert';
import TemplatesList from '../TemplatesList';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { Template } from '@src/types/templates';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import { footerPanelClassName } from '@src/styles/footerPanelClassNames';

export type Props = {
	onSelect: (template: Template) => void;
} & PanelTransitionProps;

// The forwarded ref exposes the panel's root element, so the render
// site can wrap it in a ClickAwayListener
const TemplateListWithControls = forwardRef<HTMLDivElement, Props>(
	({ onSelect, onAnimationEnd }, ref) => {
		const { t } = useTranslation();
		const { isLoadingTemplates } = useAppSelector((state) => state.UI);

		return (
			<div
				ref={ref}
				className={footerPanelClassName}
				onAnimationEnd={onAnimationEnd}
			>
				{/*<SearchBar />*/}

				{isLoadingTemplates ? (
					<Alert severity="info">{t('Loading template messages...')}</Alert>
				) : (
					<TemplatesList
						onClick={onSelect}
						displayRegisterTemplate={true}
						customSelectButtonTitle={undefined}
					/>
				)}
			</div>
		);
	}
);

export default TemplateListWithControls;
