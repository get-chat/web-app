import styled from 'styled-components';
import { SearchOutlined } from '@mui/icons-material';

export const Container = styled.div`
	overflow: hidden;
	background: #fff;
	display: flex;
	flex-direction: column;
	position: absolute;
	bottom: 50px;
	left: 0;
	right: 0;
	margin: 0 10px;
	border-radius: 10px;
	z-index: 999;
`;

export const SearchContainer = styled.div`
	display: flex;
	flex: 1;
	background-color: #fff;
	position: relative;
	align-items: center;
	border-bottom: 1px solid var(--gray-light);
`;

export const SearchIcon = styled(SearchOutlined)`
	position: absolute;
	left: 0;
	margin-top: auto;
	margin-bottom: auto;
	pointer-events: none;
	margin-left: 15px;
	height: 20px !important;
	width: 20px !important;
`;

export const SearchInput = styled.input`
	flex: 1;
	outline: 0;
	border: none;
	font-size: 16px;
	background-color: transparent;
	padding: 10px 15px 10px 40px;
`;

export const Results = styled.div`
	padding-bottom: 5px;
	max-height: 315px;
	overflow-y: auto;
	overflow-x: hidden;
	outline: 0;
	border: none;
`;

export const NoResult = styled.div`
	font-size: 14px;
	color: rgba(0, 0, 45, 0.5);
	padding: 5px 15px;
`;
