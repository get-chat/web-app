import styled from 'styled-components';

export const LoadingOverlay = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;
`;

export const TagsContainer = styled.div`
	margin-top: 12px;

	.MuiChip-root {
		margin-top: 5px;
		margin-right: 5px;
	}
`;

export const EmptyTags = styled.div`
	font-size: 15px;
	color: rgba(0, 0, 45, 0.6);
	margin-top: 4px;
`;

export const ManageTagsLink = styled.div`
	margin-top: 12px;
`;
