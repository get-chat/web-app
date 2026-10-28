import React, { useEffect, useState } from 'react';
import { isIPad13 } from 'react-device-detect';
import { cn } from '@src/lib/utils';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import AppRoutes from '@src/AppRoutes';
import { useAppDispatch } from '@src/store/hooks';
import { setReadOnly, setState } from '@src/store/reducers/UIReducer';
import { isReadOnlyConfig } from '@src/helpers/ConfigHelper';
import useAppInit from '@src/hooks/useAppInit';
import { getURLParams } from '@src/helpers/URLHelper';
import useBrandingInDocument from '@src/hooks/useBrandingInDocument';

const AppBody: React.FC = () => {
	const [bgColor] = useState(getURLParams().get('bg_color'));

	const { isLoading, config } = useAppInit();

	const dispatch = useAppDispatch();

	useBrandingInDocument();

	// Read before the router mounts: it navigates /app -> /main -> /main/login
	// without the query string, so the login page can no longer see these
	useEffect(() => {
		const params = getURLParams();

		// Sent by the backend when a regular user opens their activation link:
		// they choose a password on the login card before they can log in
		const activationCode = params.get('set_password');
		if (activationCode) {
			dispatch(
				setState({
					activationCode,
					activatedUsername: params.get('username') ?? undefined,
				})
			);
		}

		// An invite link into an inbox (/app/?invite=<code>): accepted on the
		// login card, or in the app when somebody is logged in already
		const inviteCode = params.get('invite');
		if (inviteCode) {
			dispatch(setState({ inviteCode }));
		}

		if (params.get('account_activated') === '1') {
			dispatch(
				setState({
					isAccountActivated: true,
					activatedUsername: params.get('username') ?? undefined,
				})
			);
		}
	}, []);

	useEffect(() => {
		if (config) {
			// Update UI state initially
			dispatch(setReadOnly(isReadOnlyConfig(config)));
		}
	}, [config]);

	return (
		<div
			className={cn(
				// The page behind the inbox: a soft green glow at the top over a
				// grey gradient
				'grid h-screen place-items-center bg-[radial-gradient(110%_80%_at_50%_0%,rgba(101,203,172,0.12)_0%,rgba(101,203,172,0)_60%),linear-gradient(0deg,rgb(240,241,246)_45%,rgb(206,210,226)_100%)]',
				// Prepared alternative, not in use yet: a fine dot grid over a soft
				// white glow at the top and a grey-blue gradient. To switch, replace
				// the bg-[...] class above with this one.
				// '[background:radial-gradient(circle,rgba(0,0,45,0.18)_1px,transparent_1.5px)_0_0/22px_22px,radial-gradient(110%_80%_at_50%_0%,rgba(255,255,255,0.12),transparent_60%),linear-gradient(0deg,rgb(240,241,246)_45%,rgb(207,213,238))]',
				// iPads: fill the positioned container exactly
				isIPad13 && 'absolute! inset-0! size-full!'
			)}
			style={bgColor ? { background: '#' + bgColor } : undefined}
		>
			{!isLoading && (
				<AppConfigContext.Provider value={config}>
					<ApplicationContext.Provider value={{}}>
						<AppRoutes />
					</ApplicationContext.Provider>
				</AppConfigContext.Provider>
			)}
		</div>
	);
};

export default AppBody;
