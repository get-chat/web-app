import React from 'react';
import styles from './FilterOption.module.css';
import { ButtonBase } from '@mui/material';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface Props {
	icon?: JSX.Element;
	label: string;
	onClick: () => void;
	isActive?: boolean;
}

const FilterOption: React.FC<Props> = ({
	icon,
	label,
	onClick,
	isActive = false,
}) => {
	return (
		<ButtonBase
			component="div"
			onClick={onClick}
			className={cx({
				container: true,
				active: isActive,
			})}
		>
			{icon}
			{label}
		</ButtonBase>
	);
};

export default FilterOption;
