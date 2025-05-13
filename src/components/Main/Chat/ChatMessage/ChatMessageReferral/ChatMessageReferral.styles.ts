import styled from 'styled-components';
import ReviewsIcon from '@mui/icons-material/Reviews';

export const Header = styled.div`
	display: block;
	font-size: x-small;
	color: rgba(0, 0, 45, 0.6);
	margin-bottom: 5px;
	cursor: pointer;
`;

export const HeaderIcon = styled(ReviewsIcon)`
	color: rgba(0, 0, 45, 0.4) !important;
	width: 0.6em !important;
	height: 0.6em !important;
	margin-right: 5px;
`;

export const ReferralContainer = styled.div`
	background-color: rgba(0, 0, 45, 0.1);
	border-radius: 6px;
	overflow: hidden;
	margin: -1px -6px 4px -6px;
`;

export const ReferralMedia = styled.div`
	height: auto;
	width: 100%;
	margin: 0 !important;
	border-radius: 0 !important;
`;

export const ReferralBody = styled.div`
	padding: 5px 10px;
	cursor: pointer;
`;

export const ReferralTextBody = styled.div`
	font-size: 12px;

	.emoji-mart-emoji {
		height: 12px;
		width: 12px;
	}
`;

export const ReferralSourceURL = styled.div`
	font-size: 12px;
	color: rgba(0, 0, 45, 0.6);
`;
