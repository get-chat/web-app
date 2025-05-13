import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import {
	DescribedInteractive,
	InteractiveParameter,
} from '@src/components/InteractiveMessageList/InteractiveMessageList';
import { isEmptyString } from '@src/helpers/Helpers';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Message } from '@src/types/messages';
import { fromInteractive } from '@src/helpers/MessageHelper';
import {
	Advanced,
	AdvancedToggle,
	Container,
	Description,
	HelperText,
	PreviewContainer,
	StyledAlert,
	TextFieldWrapper,
} from './SendInteractiveMessageDialog.styles';

export type Props = {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
	describedInteractive?: DescribedInteractive;
	onSend: (interactiveMessage: any) => void;
};

const SendInteractiveMessageDialog: React.FC<Props> = ({
	isVisible,
	setVisible,
	describedInteractive,
	onSend,
}) => {
	const [payload, setPayload] = useState<any>({});
	const [messageData, setMessageData] = useState<Message | null>(null);
	const [isShowErrors, setIsShowErrors] = useState(false);
	const [isShowingAdvanced, setIsShowingAdvanced] = useState(false);

	const { t } = useTranslation();

	useEffect(() => {
		if (isVisible) {
			setPayload(
				describedInteractive?.payload ? { ...describedInteractive.payload } : {}
			);
			setIsShowErrors(false);
			setIsShowingAdvanced(false);
		}
	}, [isVisible, describedInteractive]);

	useEffect(() => {
		if (payload) {
			setMessageData(fromInteractive({ ...payload }));
		}
	}, [payload]);

	const close = () => {
		setVisible(false);
	};

	const checkAndSend = () => {
		const cloneObj = JSON.parse(JSON.stringify(payload));

		if (!isFormValid()) {
			setIsShowErrors(true);
			return;
		}

		// Removing header if text is empty
		if (cloneObj.header && isEmptyString(cloneObj.header.text)) {
			delete cloneObj.header;
		}

		// Removing footer if text is empty
		if (cloneObj.footer && isEmptyString(cloneObj.footer.text)) {
			delete cloneObj.footer;
		}

		onSend(cloneObj);
		close();
	};

	function keyToLabel(str?: string | null): string {
		if (!str) {
			return '';
		}

		const replacedStr = str.replace(/[._]/g, ' '); // Replace dots and underscores with spaces
		return replacedStr.charAt(0).toUpperCase() + replacedStr.slice(1);
	}

	function getNestedValue(obj: any, path: string) {
		return path.split('.').reduce((acc, key) => acc && acc[key], obj);
	}

	function setNestedValue(obj: any, path: string, value: any) {
		const keys = path.split('.');
		const lastKey = keys.pop(); // Get the last key (e.g., 'display_text')

		const cloneObj = JSON.parse(JSON.stringify(obj));

		// Traverse the object to the second-to-last key
		const nestedObj = keys.reduce((acc, key) => acc && acc[key], cloneObj);

		if (nestedObj && lastKey) {
			nestedObj[lastKey] = value; // Set the new value
		}

		return cloneObj;
	}

	const isFormValid = () => {
		let isValid = true;

		describedInteractive?.parameters.forEach((parameter) => {
			if (
				parameter.required &&
				isEmptyString(getNestedValue(payload, parameter.key))
			) {
				isValid = false;
			}
		});

		return isValid;
	};

	const renderInput = (parameter: InteractiveParameter) => (
		<TextFieldWrapper key={parameter.key}>
			<TextField
				variant="standard"
				value={getNestedValue(payload, parameter.key)}
				onChange={(e) =>
					setPayload((prevState: any) =>
						setNestedValue(prevState, parameter.key, e.target.value)
					)
				}
				label={t(parameter.placeholder || keyToLabel(parameter.key))}
				size="small"
				multiline={true}
				fullWidth={true}
				required={parameter.required}
				error={
					isShowErrors && parameter.required
						? isEmptyString(getNestedValue(payload, parameter.key) ?? '')
						: false
				}
			/>
			{parameter.description && (
				<HelperText
					dangerouslySetInnerHTML={{
						__html: t(parameter.description),
					}}
				/>
			)}
		</TextFieldWrapper>
	);

	return (
		<Dialog open={isVisible} onClose={close}>
			<DialogTitle>
				{t(describedInteractive?.title ?? 'Send an interactive message')}
			</DialogTitle>
			<DialogContent>
				{describedInteractive && (
					<Container>
						<div>
							<Description
								dangerouslySetInnerHTML={{
									__html: t(describedInteractive.description),
								}}
							/>
							{describedInteractive.warning && (
								<StyledAlert severity="warning">
									<div
										dangerouslySetInnerHTML={{
											__html: t(describedInteractive.warning),
										}}
									/>
								</StyledAlert>
							)}
							<div>
								{payload &&
									describedInteractive.parameters
										.filter((parameter) => !parameter.advanced)
										.map((parameter) => renderInput(parameter))}
							</div>

							{payload &&
								describedInteractive.parameters.filter(
									(parameter) => parameter.advanced
								).length > 0 && (
									<AdvancedToggle
										onClick={() =>
											setIsShowingAdvanced((prevState) => !prevState)
										}
									>
										{isShowingAdvanced ? (
											<KeyboardArrowUpIcon />
										) : (
											<KeyboardArrowDownIcon />
										)}
										{t(
											isShowingAdvanced
												? 'Hide advanced settings'
												: 'Show advanced settings'
										)}
									</AdvancedToggle>
								)}
							<Advanced
								style={{ display: isShowingAdvanced ? 'block' : 'none' }}
							>
								{payload &&
									describedInteractive.parameters
										.filter((parameter) => parameter.advanced)
										.map((parameter) => renderInput(parameter))}
							</Advanced>

							{describedInteractive.info && (
								<StyledAlert severity="info">
									<div
										dangerouslySetInnerHTML={{
											__html: t(describedInteractive.info),
										}}
									/>
								</StyledAlert>
							)}
						</div>

						<PreviewContainer>
							{messageData && (
								<ChatMessage
									data={messageData}
									disableMediaPreview
									isInfoClickable={false}
								/>
							)}
						</PreviewContainer>
					</Container>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<Button onClick={checkAndSend} color="primary" autoFocus>
					{t('Send')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SendInteractiveMessageDialog;
