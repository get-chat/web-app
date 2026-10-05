import React, { useState } from 'react';
import AddIcon from '@src/components/icons/Add';
import CloseIcon from '@src/components/icons/Close';
import { Button } from '@src/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';

const AttachmentTypesMenu: React.FC = () => {
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
		<DropdownMenu
			open={open}
			onOpenChange={(isOpen) => (isOpen ? handleOpen() : handleClose())}
		>
			<DropdownMenuTrigger asChild>
				{/* MUI's SpeedDial Fab: a raised 56px circle, + turning into × */}
				<Button
					size="none"
					className="size-14 rounded-full shadow-md [&_svg]:size-6 [&_svg]:text-white!"
					aria-label="Send a file"
				>
					{open ? <CloseIcon /> : <AddIcon />}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top">
				<DropdownMenuItem key="document">
					<span>Like</span>
					Document
				</DropdownMenuItem>
				<DropdownMenuItem key="image">
					<span>Camera</span>
					Image
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default AttachmentTypesMenu;
