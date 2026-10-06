import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { AxiosError } from 'axios';
import { updateUserAvailability } from '@src/api/usersApi';
import { setIsUserAvailable } from '@src/store/reducers/isUserAvailableReducer';
import { Switch } from '@src/components/ui/switch';
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
					'flex cursor-pointer items-center gap-3 rounded-xl py-2.5 pr-2.5 pl-3.5 ring-1 transition-[background-color,box-shadow] duration-200 ease-in-out ring-inset',
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

				<div className="min-w-0 flex-1">
					<div className="truncate text-[13px] leading-tight font-semibold">
						{isUserAvailable
							? t('You are active now.')
							: t('You are inactive now.')}
					</div>
					<div className="truncate text-[12px] leading-tight opacity-75">
						{t('Click to toggle your status.')}
					</div>
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
