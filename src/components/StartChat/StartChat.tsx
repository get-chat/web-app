import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import DialpadIcon from '@mui/icons-material/Dialpad';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	getCountryFromWaId,
	prepareWaId,
} from '@src/helpers/PhoneNumberHelper';
import { getChatPath } from '@src/helpers/RouteHelper';
import { useTranslation } from 'react-i18next';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { CancelTokenSource } from 'axios';
import * as Styled from './StartChat.styles';
import Contacts from '@src/components/Contacts';
import PhoneNumberInput from '@src/components/PhoneNumberInput';
import { useAppSelector } from '@src/store/hooks';
import { Recipient } from '@src/types/persons';
import { PanelTransitionProps } from '@src/styles/panelTransitions';

interface Props extends PanelTransitionProps {
	onHide: () => void;
}

const StartChat: React.FC<Props> = ({ onHide, isExiting, onAnimationEnd }) => {
	const { t } = useTranslation();

	const [isVerifying, setVerifying] = useState(false);
	const [isPhoneNumberFormVisible, setPhoneNumberFormVisible] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState('');
	const [isPhoneNumberValid, setPhoneNumberValid] = useState(false);
	const [isPhoneNumberInvalidShown, setPhoneNumberInvalidShown] =
		useState(false);

	// The inbox's own number (digits, no "+") is used to default the country code.
	const businessNumber = useAppSelector((state) => state.phoneNumber.value);
	const defaultCountry = getCountryFromWaId(businessNumber);

	let verifyPhoneNumberCancelTokenSourceRef = useRef<CancelTokenSource>();

	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			// Escape
			if (event.key === 'Escape') {
				onHide();
				event.stopPropagation();
			}
		};

		document.addEventListener('keydown', handleKey);

		verifyPhoneNumberCancelTokenSourceRef.current = generateCancelToken();

		return () => {
			document.removeEventListener('keydown', handleKey);
			verifyPhoneNumberCancelTokenSourceRef.current?.cancel();
		};
	}, []);

	const verifyContact = useCallback(
		(phoneNumber: string, data?: Recipient) => {
			const failureCallback = () => {
				window.displayCustomError(
					'There is no WhatsApp account connected to this phone number.'
				);
			};

			const waId = prepareWaId(phoneNumber);

			if (!waId) {
				failureCallback();
				return;
			}

			// Skipping verifying as it is deprecated

			navigate(`${getChatPath(waId)}${location.search}`, {
				state: {
					person: {
						name: data?.name,
						initials: data?.initials,
						avatar: data?.avatar,
						waId: waId,
					},
				},
			});

			// Hide contacts
			onHide();
		},
		[navigate, location.search, onHide]
	);

	// Memoized so typing in the phone-number field (which updates local state)
	// does not re-render the whole contact list on every keystroke.
	const contactsElement = useMemo(
		() => <Contacts verifyContact={verifyContact} isVerifying={isVerifying} />,
		[verifyContact, isVerifying]
	);

	const handleStartByPhone = () => {
		if (!isPhoneNumberValid) {
			setPhoneNumberInvalidShown(true);
			return;
		}
		verifyContact(phoneNumber);
	};

	return (
		<Styled.ContactsContainer
			$isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			<Styled.ContactsHeader>
				<IconButton onClick={onHide} size="large">
					<ArrowBack />
				</IconButton>

				<h3>{t('New chat')}</h3>
			</Styled.ContactsHeader>

			<Styled.StartByPhoneNumberWrapper>
				<Styled.StartByPhoneNumber
					onClick={() => setPhoneNumberFormVisible((prevState) => !prevState)}
				>
					<Styled.StyledListItem
						// @ts-ignore
						button
						style={{ padding: 0 }}
					>
						<Styled.StartByPhoneNumberInner data-test-id="start-new-chat">
							<DialpadIcon />
							<span>{t('Start a chat with a phone number')}</span>
						</Styled.StartByPhoneNumberInner>
					</Styled.StyledListItem>
				</Styled.StartByPhoneNumber>

				{isPhoneNumberFormVisible && (
					<Styled.FormWrapper>
						<PhoneNumberInput
							defaultCountry={defaultCountry}
							autoFocus
							error={isPhoneNumberInvalidShown}
							onChange={(value, isValid) => {
								setPhoneNumber(value);
								setPhoneNumberValid(isValid);
								setPhoneNumberInvalidShown(false);
							}}
							onEnter={handleStartByPhone}
						/>
						<Button
							color="primary"
							variant="contained"
							size="small"
							fullWidth
							disableElevation
							onClick={handleStartByPhone}
							data-test-id="start-chat-by-phone"
						>
							{t('Start')}
						</Button>
					</Styled.FormWrapper>
				)}
			</Styled.StartByPhoneNumberWrapper>

			{contactsElement}
		</Styled.ContactsContainer>
	);
};

export default StartChat;
