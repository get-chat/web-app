import styled from 'styled-components';

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
