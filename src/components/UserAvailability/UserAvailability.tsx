import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { AxiosError } from 'axios';
import { updateUserAvailability } from '@src/api/usersApi';
import { setIsUserAvailable } from '@src/store/reducers/isUserAvailableReducer';
import { Switch } from '@src/components/ui/switch';
import { cn } from '@src/lib/utils';

const UserAvailability = () => {
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
		<div
			className={cn(
				'flex cursor-pointer items-center justify-between py-2.5 pr-1.5 pl-3.75 transition-[background-color] duration-200 ease-in-out',
				isUserAvailable
					? 'bg-success-soft text-success'
					: 'bg-warning-soft text-warning'
			)}
			onClick={toggleUserAvailability}
		>
			<div>
				<div className="text-[14px] font-semibold">
					{isUserAvailable
						? t('You are active now.')
						: t('You are inactive now.')}
				</div>
				<div className="text-[12px] font-medium">
					{t('Click to toggle your status.')}
				</div>
			</div>
			<Switch
				checked={isUserAvailable}
				onClick={(event) => {
					event.stopPropagation();
					toggleUserAvailability();
				}}
				// Green when on; when off, a deeper shade of the bar's warning
				// yellow. The margins keep MUI's footprint.
				color="success"
				className="my-[9px] mr-3.75 data-[state=unchecked]:bg-warning-strong"
			/>
		</div>
	);
};

export default UserAvailability;
