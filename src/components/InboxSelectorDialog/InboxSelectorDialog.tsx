import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	clearCurrentTenant,
	clearTenantTokens,
	getApiBaseURLsMergedWithConfig,
	getCurrentApiBaseURL,
	storeCurrentApiBaseURL,
} from '@src/helpers/StorageHelper';
import { prepareURLForDisplay } from '@src/helpers/URLHelper';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';

interface Props {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
}

const InboxSelectorDialog: React.FC<Props> = ({ isVisible, setVisible }) => {
	const { t } = useTranslation();

	const config = useContext(AppConfigContext);

	const [current, setCurrent] = useState<string | null | undefined>();
	const [urls, setUrls] = useState<string[]>([]);

	useEffect(() => {
		if (isVisible && !urls.length) {
			// @ts-ignore
			const storedCurrent = getCurrentApiBaseURL() ?? config.API_BASE_URL;
			setCurrent(storedCurrent);

			const storedURLs = getApiBaseURLsMergedWithConfig(config);
			// Sort
			storedURLs.sort((a, b) =>
				a == storedCurrent ? -1 : b == storedCurrent ? 1 : 0
			);

			setUrls(storedURLs);
		}
	}, [isVisible]);

	const close = () => {
		setVisible(false);
	};

	const onSelect = (url: string) => {
		if (url !== current) {
			storeCurrentApiBaseURL(url);
			// The inboxes and their tokens belong to the other host
			clearCurrentTenant();
			clearTenantTokens();
			location.reload();
		} else {
			close();
		}
	};

	return (
		<Dialog open={isVisible} onOpenChange={(isOpen) => !isOpen && close()}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>{t('Select an inbox')}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<div className="h-75 max-h-full overflow-y-auto rounded-[10px] bg-gray-lighter">
						{urls.map((item, index) => (
							<button
								key={index}
								type="button"
								className="flex w-full cursor-pointer items-center border-0 bg-transparent px-4 py-2 text-left font-[inherit] text-inherit outline-none! transition-colors hover:bg-black/4 focus-visible:bg-black/12"
								onClick={() => onSelect(item)}
							>
								<div>
									<div>{prepareURLForDisplay(item)}</div>
									{item === current && (
										<div className="text-[12px] text-primary">
											{t('Your current inbox')}
										</div>
									)}
								</div>
							</button>
						))}
					</div>
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default InboxSelectorDialog;
