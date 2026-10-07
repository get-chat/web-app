import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { AxiosError } from 'axios';
import { updateUserAvailability } from '@src/api/usersApi';
import { setIsUserAvailable } from '@src/store/reducers/isUserAvailableReducer';
import { Switch } from '@src/components/ui/switch';
import { Button } from '@src/components/ui/button';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import InfoIcon from '@src/components/icons/Info';
import { cn } from '@src/lib/utils';

interface Props {
	/** Classes for the area around the card, e.g. its background */
	className?: string;
}

const UserAvailability: React.FC<Props> = ({ className }) => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const { t } = useTranslation();

	const isUserAvailable = useAppSelector(
		(state) => state.isUserAvailable.value
	);

	const dispatch = useAppDispatch();

	const toggleUserAvailability = async () => {
		try {
			const data = await updateUserAvailability(currentUser?.id ?? 0, {
				is_available: !isUserAvailable,
			});
			dispatch(setIsUserAvailable(data.is_available));
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	return (
		// A rounded status card inset in the sidebar, tinted green when the
		// user is active and amber when not; the whole card toggles
		<div className={cn('px-3 pt-1 pb-3', className)}>
			<div
				className={cn(
					'flex cursor-pointer items-center gap-2.5 rounded-xl py-2.5 pr-2.5 pl-3.5 ring-1 transition-[background-color,box-shadow] duration-200 ease-in-out ring-inset',
					isUserAvailable
						? 'bg-success-soft/70 text-success ring-success/15 hover:bg-success-soft'
						: 'bg-warning-soft/70 text-warning ring-warning/15 hover:bg-warning-soft'
				)}
				onClick={toggleUserAvailability}
			>
				{/* Presence dot: a soft pulsing halo while active */}
				<span className="relative flex size-2.5 shrink-0">
					{isUserAvailable && (
						<span className="absolute inset-0 rounded-full bg-success opacity-60 motion-safe:animate-ping" />
					)}
					<span
						className={cn(
							'relative size-2.5 rounded-full transition-[background-color] duration-200',
							isUserAvailable ? 'bg-success' : 'bg-warning-strong'
						)}
					/>
				</span>

				<div className="flex min-w-0 flex-1 items-center gap-1">
					<span className="truncate text-[13px] leading-tight font-semibold">
						{isUserAvailable
							? t('You are active now.')
							: t('You are inactive now.')}
					</span>

					{/* What availability means, on hover, focus or long-press */}
					<SimpleTooltip
						title={
							<div className="flex flex-col gap-1.5">
								<div className="font-semibold">{t('Availability')}</div>
								<p>
									{t(
										'While you are active, new chats can be assigned to you automatically.'
									)}
								</p>
								<p>
									{t(
										'When you become inactive, your chats may be unassigned or passed to an active teammate, depending on your inbox settings.'
									)}
								</p>
								<p>
									{t(
										'You are set as active when you log in and as inactive when you log out. Admins can also change your status.'
									)}
								</p>
							</div>
						}
						contentClassName="max-w-[260px] px-3 py-2.5 text-[12px] leading-[1.45] font-normal"
					>
						<Button
							variant="unstyled"
							size="none"
							aria-label={t('Availability')}
							className="size-5 shrink-0 rounded-full opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 [&_.app-icon]:size-4! [&_.app-icon]:text-current!"
							// Only explains; the rest of the card toggles
							onClick={(event) => event.stopPropagation()}
						>
							<InfoIcon />
						</Button>
					</SimpleTooltip>
				</div>

				<Switch
					checked={isUserAvailable}
					onClick={(event) => {
						event.stopPropagation();
						toggleUserAvailability();
					}}
					// Green when on; when off, a deeper shade of the card's amber
					color="success"
					className="data-[state=unchecked]:bg-warning-strong"
				/>
			</div>
		</div>
	);
};

export default UserAvailability;
