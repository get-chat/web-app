import React from 'react';
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

const TemplateListWithControls: React.FC<Props> = ({
	onSelect,
	isExiting,
	onAnimationEnd,
}) => {
	const { t } = useTranslation();
	const { isLoadingTemplates } = useAppSelector((state) => state.UI);

	return (
		<Styled.Outer $isExiting={isExiting} onAnimationEnd={onAnimationEnd}>
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
};

export default TemplateListWithControls;
