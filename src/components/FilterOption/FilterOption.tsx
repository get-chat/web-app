import React from 'react';
import styles from './FilterOption.module.css';
import { ButtonBase } from '@mui/material';

interface Props {
	icon?: JSX.Element;
	label: string;
	onClick: () => void;
}

const FilterOption: React.FC<Props> = ({ icon, label, onClick }) => {
	return (
		<ButtonBase component="div" onClick={onClick} className={styles.container}>
			{icon}
			{label}
		</ButtonBase>
	);
};

export default FilterOption;
