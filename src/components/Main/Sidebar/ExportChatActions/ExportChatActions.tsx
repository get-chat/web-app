import React from 'react';
import { Button } from '@src/components/ui/button';
import { Trans, useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';

interface Props {
	onShowDateRange: () => void;
	onExport: () => void;
	onCancel: () => void;
}

const ExportChatActions: React.FC<Props> = ({
	onShowDateRange,
	onExport,
	onCancel,
}) => {
	const { t } = useTranslation();
	const { selectedTags, selectedChats } = useAppSelector((state) => state.UI);

	return (
		<div className="flex flex-col bg-light-blue px-3.75 py-2.5 text-white">
			<h3 className="m-0 text-[18px] font-normal">{t('Export Chats')}</h3>

			<div className="text-[14px]">
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: {
							contacts_count: selectedChats.length,
							tags_count: selectedTags.length,
						},
					}}
				>
					Selected %(contacts_count)d contact(s) and %(tags_count)d tag(s).
				</Trans>
			</div>

			{/* White labels on the blue panel; hovers keep each button's colour */}
			<div className="mt-3.75 flex justify-end [&_[data-slot=button]]:text-white">
				<Button variant="ghost" color="secondary" onClick={onCancel}>
					{t('Cancel')}
				</Button>

				<Button variant="ghost" color="primary" onClick={onShowDateRange}>
					{t('Export by date')}
				</Button>

				<Button
					variant="ghost"
					color="primary"
					onClick={onExport}
					disabled={selectedChats.length === 0 && selectedTags.length === 0}
				>
					{t('Export')}
				</Button>
			</div>
		</div>
	);
};

export default ExportChatActions;
