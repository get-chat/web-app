import styled from 'styled-components';
import { MenuItem } from '@mui/material';

export const Sidebar = styled.div<{ $isHidden?: boolean }>`
	position: relative;
	display: ${({ $isHidden }) => ($isHidden ? 'none' : 'flex')};
	flex-direction: column;
	flex: 0.3;

	@media only screen and (max-width: 750px) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	@media only screen and (max-width: 1024px) {
		flex: 0.4;
	}
`;

export const Header = styled.div.attrs({
	className: 'sidebar__header',
})`
	height: var(--header-height);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 15px;
	background-color: var(--gray-light);
	/*border-right: 1px solid lightgray;*/

	@media only screen and (max-width: 750px) {
		padding: 4px 10px;
	}
`;

export const HeaderRight = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	> .MuiSvgIcon-root {
		margin-right: 2vw;
		font-size: 24px !important;
	}
`;

export const LoadingMore = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 5px;
	z-index: 1;
	display: flex;
	justify-content: center;
	padding-bottom: 20px;
	background: linear-gradient(
		0deg,
		rgba(255, 255, 255, 1) 0%,
		rgba(255, 255, 255, 0) 100%
	);
`;

export const LoadingMoreWrapper = styled.div`
	width: auto;
	padding: 10px 10px 4px 10px;
	border-radius: 40px;
	background-color: white;
	box-shadow: 0 6px 15px -6px rgba(0, 0, 45, 0.4);
`;

export const ResultsContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: white;
	overflow-y: auto;

	h3 {
		padding: 10px 15px;
		font-weight: 400;
		color: var(--color-primary);
	}
`;

export const NoResults = styled.span`
	display: block;
	color: rgba(0, 0, 45, 0.6);
	font-size: 14px;
	padding: 10px 15px;
	word-break: break-word;
`;

export const MessageList = styled.div`
	.MuiListItem-root {
		padding: 0;
	}
`;

export const RefreshMenuItem = styled(MenuItem)`
	display: none !important;

	@media only screen and (max-width: 750px) {
		display: flex !important;
	}
`;
