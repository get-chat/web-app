import React from 'react';
import styles from './FilterOption.module.css';
import { ButtonBase, IconButton } from '@mui/material';
import classNames from 'classnames/bind';
import CloseIcon from '@mui/icons-material/Close';

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
			<div className={styles.label}>{label}</div>
			{isActive && (
				<IconButton className={styles.actionIcon} size="small">
					<CloseIcon />
				</IconButton>
			)}
		</ButtonBase>
	);
};

export default FilterOption;
