import styled from 'styled-components';

export const BusinessProfileContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: var(--gray-light);
	z-index: 10;
`;

export const Header = styled.div`
	height: var(--header-height);
	display: flex;
	align-items: center;
	background-color: var(--color-primary);
	padding: 4px 15px;
	color: white;
	font-size: 18px;

	h3 {
		margin-left: 15px;
		font-weight: 400;
		font-size: 18px;
	}

	.MuiSvgIcon-root {
		color: white !important;
	}
`;

export const Body = styled.div`
	flex: 1 1;
	overflow-x: hidden;
	overflow-y: auto;
`;

export const Section = styled.div`
	padding: 20px;
	margin-bottom: 10px;
	background-color: white;
	box-shadow: 0 1px 3px var(--shadow-light);

	h3 {
		font-weight: 400;
		text-align: center;
	}

	span:not(.MuiButton-label),
	.subSection > div {
		font-size: 14px;
		color: rgba(0, 0, 45, 0.6);
	}

	.MuiFormControl-root {
		margin-bottom: 20px;
	}
`;

export const SubSection = styled.div`
	> div {
		margin-top: 15px;
	}

	h5 {
		color: rgba(0, 0, 45, 0.5);
	}
`;

export const FieldErrorMessage = styled.div`
	color: var(--red-dark);
	font-size: 13px;
	margin-top: -10px;
	margin-bottom: 20px;
`;

export const AvatarContainer = styled.div<{ $enabled?: boolean }>`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	.MuiButton-root {
		margin-bottom: 15px;
	}

	.MuiAvatar-root {
		height: 200px;
		width: 200px;
		margin-bottom: 15px;
		font-size: 5rem !important;
		transition: opacity linear 0.1s;

		${({ $enabled }) =>
			$enabled &&
			`
      &:hover {
        cursor: pointer;
        opacity: 0.75;
      }
    `}
	}
`;

export const AvatarDeleteContainer = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 10px;
`;

export const AvatarInfo = styled.div`
	margin-bottom: 15px;
	text-align: center;
	font-size: 0.8rem;
`;

export const ChangePasswordContainer = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 10px;
`;

export const SectionHeader = styled.div`
	display: flex;
	margin-bottom: 15px;

	h5 {
		font-size: 14px;
		font-weight: 400;
		color: var(--color-primary);
		flex: 1 1;
	}
`;

export const SubSectionAction = styled.div`
	display: flex;
	justify-content: flex-end;
`;

export const ChangeInboxLink = styled.a`
	color: var(--color-secondary);
`;
