import React, { useState } from 'react';
import SpeedDialIcon from '@mui/lab/SpeedDialIcon';
import CloseIcon from '@mui/icons-material/Close';
import SpeedDial from '@mui/lab/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';

export function AttachmentTypesMenu() {
	const [open, setOpen] = useState(false);
	const [hidden, setHidden] = useState(false);

	const handleVisibility = () => {
		setHidden((prevHidden) => !prevHidden);
	};

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<SpeedDial
			icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
			ariaLabel="Send a file"
			onClose={handleClose}
			onOpen={handleOpen}
			open={open}
		>
			<SpeedDialAction key="document" title="Document" icon="Like" />

			<SpeedDialAction key="image" title="Image" icon="Camera" />
		</SpeedDial>
	);
}
