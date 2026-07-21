import React, { forwardRef } from 'react';
import Alert from '@mui/material/Alert';
import TemplatesList from '../TemplatesList';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import { Template } from '@src/types/templates';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import * as Styled from './TemplateListWithControls.styles';

export type Props = {
	onSelect: (template: Template) => void;
} & PanelTransitionProps;

// The forwarded ref exposes the panel's root element, so the render
// site can wrap it in a ClickAwayListener
const TemplateListWithControls = forwardRef<HTMLDivElement, Props>(
	({ onSelect, isExiting, onAnimationEnd }, ref) => {
		const { t } = useTranslation();
		const { isLoadingTemplates } = useAppSelector((state) => state.UI);

		return (
			<Styled.Outer
				ref={ref}
				$isExiting={isExiting}
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
			</Styled.Outer>
		);
	}
);

export default TemplateListWithControls;
