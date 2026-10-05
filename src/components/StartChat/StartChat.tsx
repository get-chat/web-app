import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { ArrowBack } from '@src/components/icons';
import DialpadIcon from '@src/components/icons/Dialpad';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	getCountryFromWaId,
	prepareWaId,
} from '@src/helpers/PhoneNumberHelper';
import { getChatPath } from '@src/helpers/RouteHelper';
import { useTranslation } from 'react-i18next';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { CancelTokenSource } from 'axios';
import Contacts from '@src/components/Contacts';
import PhoneNumberInput from '@src/components/PhoneNumberInput';
import { useAppSelector } from '@src/store/hooks';
import { Recipient } from '@src/types/persons';
import {
	overlayPanelAnimation,
	PanelTransitionProps,
} from '@src/styles/panelTransitions';
import PanelHeader from '@src/components/PanelHeader';
import { cn } from '@src/lib/utils';
import { Button } from '@src/components/ui/button';

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
		<div
			className={cn(
				'absolute inset-0 z-10 flex flex-col bg-white',
				overlayPanelAnimation(isExiting)
			)}
			onAnimationEnd={onAnimationEnd}
		>
			<PanelHeader
				title={t('New chat')}
				icon={<ArrowBack />}
				onClose={onHide}
			/>

			<div className="bg-white">
				<div
					className="bg-(--color-primary-transparent) text-primary"
					onClick={() => setPhoneNumberFormVisible((prevState) => !prevState)}
				>
					<button
						type="button"
						className="relative flex w-full cursor-pointer items-center border-0 bg-transparent p-0 text-left text-[14px] text-inherit transition-[background-color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none! hover:bg-(--color-primary-transparent-darker) focus-visible:bg-(--color-primary-transparent-darker)"
					>
						<div
							className="flex-1 px-3.75 py-5 [&_.app-icon]:mr-2.5 [&_.app-icon]:size-[0.8em]! [&_.app-icon]:text-primary!"
							data-test-id="start-new-chat"
						>
							<DialpadIcon />
							<span>{t('Start a chat with a phone number')}</span>
						</div>
					</button>
				</div>

				{isPhoneNumberFormVisible && (
					<div className="flex flex-col gap-3 px-3.75 py-2.5">
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
							variant="solid"
							color="primary"
							size="sm"
							className="w-full"
							onClick={handleStartByPhone}
							data-test-id="start-chat-by-phone"
						>
							{t('Start')}
						</Button>
					</div>
				)}
			</div>

			{contactsElement}
		</div>
	);
};

export default StartChat;
