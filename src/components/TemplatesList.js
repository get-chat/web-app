import React from 'react';
import { sortTemplateComponents } from '../helpers/TemplateMessageHelper';
import { Button } from '@material-ui/core';

const TemplatesList = ({ templates, onClick }) => {
	return (
		<>
			{Object.entries(templates).map((template, index) => (
				<div key={template[0]} className="templateMessageWrapper">
					<div className="chat__message chat__outgoing messageType__template">
						{/*<span className={"templateMessage__status " + template[1].status}>{template[1].status}</span>*/}
						<div className="templateMessage__message">
							<h4>{template[1].name}</h4>
							{sortTemplateComponents(template[1].components).map(
								(comp, index) => (
									<div key={index}>
										<span className="templateType bold lowercase">
											{comp.type}:
										</span>{' '}
										{comp.text ?? comp.format ?? JSON.stringify(comp.buttons)}
									</div>
								)
							)}
						</div>
					</div>

					{template[1].status === 'approved' && (
						<Button onClick={() => onClick?.(template[1])}>Send</Button>
					)}
				</div>
			))}
		</>
	);
};

export default TemplatesList;
