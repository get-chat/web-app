import styled from 'styled-components';

export const ContactDetailsContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex: 0.4 1;
	border-left: 1px solid lightgray;
	z-index: 10;

	@media only screen and (max-width: 750px) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-left: none;
	}
`;

export const Header = styled.div`
	height: var(--header-height);
	display: flex;
	align-items: center;
	padding: 4px 15px;
	background-color: var(--gray-light);

	> h3 {
		margin-left: 15px;
		font-weight: 400;
		font-size: 18px;
	}

	@media only screen and (max-width: 750px) {
		padding: 4px 10px;
	}
`;

export const Body = styled.div`
	background-color: var(--gray-light);
	flex: 1 1;
	position: relative;
	display: flex;
	flex-direction: column;
	overflow-y: auto;

	a {
		color: var(--color-light-blue);
	}
`;

export const Section = styled.div`
	padding: 20px;
	margin-bottom: 10px;
	background-color: white;
	box-shadow: 0 1px 3px var(--shadow-light);

	> h3 {
		text-align: center;
		font-size: 20px;
		font-weight: 600;
	}

	> h3 .emoji-mart-emoji {
		height: 20px !important;
		width: 20px !important;
	}

	> span,
	.content__sub {
		font-size: 14px;
		color: rgba(0, 0, 45, 0.6);
	}
`;

export const AvatarContainer = styled.div`
	display: flex;
	justify-content: center;
`;

export const JobInfo = styled.div`
	font-size: 14px;
	font-weight: 600;
	text-align: center;
	color: rgba(0, 0, 45, 0.4);
	margin-bottom: 10px;
`;

export const LastMessageAt = styled.div`
	text-align: center;
	font-size: 14px;
`;

export const TagsContainer = styled.div`
	margin-top: 12px;
`;

export const Tag = styled.div`
	cursor: pointer;
	display: inline-block;
	margin-right: 10px;

	.MuiSvgIcon-root {
		margin-right: 5px;
		vertical-align: baseline;
	}

	> span {
		display: inline-block;
		max-width: 150px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
`;

export const AssigneesContainer = styled.div`
	padding: 5px 10px;
	border: 2px solid var(--gray-light);
	border-radius: 10px;
	font-size: 14px;
	margin-top: 12px;

	> div {
		padding: 5px 0;
	}

	.MuiSvgIcon-root {
		vertical-align: middle;
		margin-right: 10px;
		height: 0.8em;
		width: 0.8em;
	}
`;

export const SectionTitle = styled.div`
	font-size: 16px;
`;

export const ProviderTitle = styled.div`
	display: inline-block;
	padding: 5px 10px;
	border-radius: 16px;
	background-color: var(--gray-light);
	color: rgba(0, 0, 45, 0.8);
	margin-bottom: 12px;

	img {
		height: 16px;
		width: 16px;
		vertical-align: middle;
		margin-right: 4px;
	}
`;

export const Subtitle = styled.div`
	font-size: 14px;
`;

export const Content = styled.div`
	margin-bottom: 8px;
`;

export const ContentSub = styled.div`
	font-size: 14px;
	color: rgba(0, 0, 45, 0.6);
`;
