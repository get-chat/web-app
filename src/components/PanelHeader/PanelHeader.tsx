import React from 'react';
import { Button } from '@src/components/ui/button';

interface Props {
	title: React.ReactNode;
	/** The close or back icon */
	icon: React.ReactNode;
	onClose: () => void;
}

/** The green header of the panels that open over the sidebar */
const PanelHeader: React.FC<Props> = ({ title, icon, onClose }) => (
	<div className="flex h-(--header-height) items-center bg-primary px-3.75 py-1 text-white [&_.app-icon]:text-white!">
		<Button variant="ghost" color="neutral" size="icon-xl" onClick={onClose}>
			{icon}
		</Button>

		<h3 className="ml-3.75 text-[18px] font-normal">{title}</h3>
	</div>
);

export default PanelHeader;
