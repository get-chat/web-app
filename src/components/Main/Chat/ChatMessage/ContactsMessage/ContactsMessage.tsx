import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { prepareWaId } from '@src/helpers/PhoneNumberHelper';
import { getChatPath } from '@src/helpers/RouteHelper';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { Message } from '@src/types/messages';
import ChatIcon from '@src/components/icons/Chat';
import CustomAvatar from '@src/components/CustomAvatar';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';

interface Props {
	data: Message;
}

const ContactsMessage: React.FC<Props> = ({ data }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const contacts = data?.waba_payload?.contacts;
	const isUserActionsRestricted = useIsUserActionsRestricted();

	const handleClick = (targetWaId: string) => {
		const waId = prepareWaId(targetWaId);
		navigate(`${getChatPath(waId)}${location.search}`);
	};

	return (
		// The contacts, 5px apart
		<div className="relative min-w-[180px] [&>*+*]:mt-1.25">
			{contacts?.map((contact: any, contactIndex: number) => (
				<div key={contactIndex}>
					<div className="flex items-center py-1.25">
						<>
							<CustomAvatar
								className="mr-2.5 size-[35px]"
								generateBgColorBy={contact.name?.formatted_name}
							>
								{generateInitialsHelper(contact.name?.formatted_name ?? '')}
							</CustomAvatar>
							<div className="font-semibold" key={contactIndex}>
								{contact.name?.formatted_name ?? ''}
							</div>
						</>
					</div>
					<div className="my-1.25 flex flex-col items-stretch">
						{contact.phones?.map((phoneObj: any, phoneObjIndex: number) => (
							// Was MUI's ButtonBase: a bare button
							<button
								type="button"
								className="relative m-0 mb-1.25 flex flex-1 cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent px-1.25 py-0.75 [font:inherit] text-inherit outline-none! transition-[background-color] duration-150 select-none [-webkit-tap-highlight-color:transparent] [text-align:inherit] hover:bg-ink/4 focus-visible:shadow-[0_0_0_3px_rgba(101,203,172,0.3)]"
								key={phoneObjIndex}
								onClick={() => handleClick(phoneObj.wa_id)}
							>
								<ChatIcon className="size-[0.8em]! text-primary!" />
								<div className="ml-3.75 flex flex-col items-start">
									{phoneObj?.type && (
										<div className="text-[12px] text-ink/60">
											{phoneObj.type}
										</div>
									)}
									{!isUserActionsRestricted && (
										<div className="text-primary">
											{phoneObj.phone ?? phoneObj.wa_id}
										</div>
									)}
								</div>
							</button>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default ContactsMessage;
