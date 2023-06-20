import React from 'react';
import styles from './FilterOption.module.css';

interface Props {
	icon?: JSX.Element;
	label: string;
	onClick: () => void;
}

const FilterOption: React.FC<Props> = ({ icon, label, onClick }) => {
	return (
		<div onClick={onClick} className={styles.container}>
			{icon}
			{label}
		</div>
	);
};

export default FilterOption;
