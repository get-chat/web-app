import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from '@src/components/ui/alert';
import { Avatar, AvatarFallback } from '@src/components/ui/avatar';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import { Checkbox } from '@src/components/ui/checkbox';
import {
	Collapsible,
	CollapsibleContent,
} from '@src/components/ui/collapsible';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@src/components/ui/input-group';
import { Item, ItemContent, ItemTitle } from '@src/components/ui/item';
import { Progress } from '@src/components/ui/progress';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@src/components/ui/select';
import { Separator } from '@src/components/ui/separator';
import { Spinner } from '@src/components/ui/spinner';
import { Switch } from '@src/components/ui/switch';
import { Textarea } from '@src/components/ui/textarea';

describe('UI components', () => {
	test('Button: loading disables it and shows a spinner', () => {
		render(
			<Button variant="outline" color="destructive" loading>
				Delete
			</Button>
		);
		const button = screen.getByRole('button', { name: /delete/i });
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute('aria-busy', 'true');
		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	test('Button: asChild renders the child element', () => {
		render(
			<Button asChild variant="link">
				<a href="https://example.com">Docs</a>
			</Button>
		);
		expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
			'data-slot',
			'button'
		);
	});

	test('Alert: severity icon, title and close button', () => {
		const onClose = jest.fn();
		render(
			<Alert severity="warning" variant="outline" onClose={onClose}>
				<AlertTitle>Heads up</AlertTitle>
				<AlertDescription>Something happened</AlertDescription>
			</Alert>
		);
		expect(screen.getByRole('alert')).toHaveAttribute(
			'data-severity',
			'warning'
		);
		fireEvent.click(screen.getByRole('button', { name: 'Close' }));
		expect(onClose).toHaveBeenCalled();
	});

	test('Alert: icon={false} hides the icon', () => {
		const { container } = render(<Alert icon={false}>No icon</Alert>);
		expect(
			container.querySelector('[data-slot="alert-icon"]')
		).not.toBeInTheDocument();
	});

	test('Badge: onDelete adds a remove button', () => {
		const onDelete = jest.fn();
		render(
			<Badge color="selection" onDelete={onDelete}>
				Tag
			</Badge>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
		expect(onDelete).toHaveBeenCalled();
	});

	test('Checkbox and Switch toggle', () => {
		const onCheckedChange = jest.fn();
		render(
			<>
				<Checkbox aria-label="Agree" onCheckedChange={onCheckedChange} />
				<Checkbox aria-label="Some" checked="indeterminate" />
				<Switch aria-label="Online" color="selection" size="lg" />
			</>
		);
		fireEvent.click(screen.getByRole('checkbox', { name: 'Agree' }));
		expect(onCheckedChange).toHaveBeenCalledWith(true);
		expect(screen.getByRole('checkbox', { name: 'Some' })).toHaveAttribute(
			'data-state',
			'indeterminate'
		);
		fireEvent.click(screen.getByRole('switch', { name: 'Online' }));
		expect(screen.getByRole('switch', { name: 'Online' })).toHaveAttribute(
			'data-state',
			'checked'
		);
	});

	test('Dialog: header, scrolling body and footer', () => {
		render(
			<Dialog open>
				<DialogContent size="lg">
					<DialogHeader>
						<DialogTitle>Assign chat</DialogTitle>
						<DialogDescription>Pick a user</DialogDescription>
					</DialogHeader>
					<DialogBody>Body</DialogBody>
					<DialogFooter showCloseButton />
				</DialogContent>
			</Dialog>
		);
		const dialog = screen.getByRole('dialog', { name: 'Assign chat' });
		expect(dialog).toHaveAttribute('data-size', 'lg');
		expect(screen.getByText('Body')).toHaveAttribute(
			'data-slot',
			'dialog-body'
		);
	});

	test('Form controls render with their variants', () => {
		render(
			<>
				<Field data-invalid>
					<FieldLabel htmlFor="name">Name</FieldLabel>
					<Input id="name" variant="underline" size="lg" aria-invalid />
					<FieldError>Required</FieldError>
				</Field>
				<Textarea aria-label="Body" variant="underline" />
				<InputGroup variant="underline">
					<InputGroupInput aria-label="Search" />
					<InputGroupAddon>@</InputGroupAddon>
				</InputGroup>
				<Select defaultValue="en">
					<SelectTrigger aria-label="Language" variant="underline">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="en">English</SelectItem>
					</SelectContent>
				</Select>
			</>
		);
		expect(screen.getByLabelText('Name')).toHaveAttribute(
			'data-variant',
			'underline'
		);
		expect(screen.getByText('Required')).toBeInTheDocument();
		expect(
			screen.getByRole('combobox', { name: 'Language' })
		).toHaveTextContent('English');
	});

	test('Progress: determinate and indeterminate', () => {
		const { container } = render(
			<>
				<Progress value={40} />
				<Progress size="sm" />
			</>
		);
		const indicators = container.querySelectorAll(
			'[data-slot="progress-indicator"]'
		);
		expect(indicators[0]).toHaveStyle({ transform: 'translateX(-60%)' });
		expect(indicators[1].className).toContain('animate-progress-indeterminate');
	});

	test('Display components render', () => {
		render(
			<>
				<Spinner size={24} />
				<Avatar size="lg" shape="rounded">
					<AvatarFallback>BA</AvatarFallback>
				</Avatar>
				<Separator />
				<Item asChild size="xs" data-selected>
					<button type="button">
						<ItemContent>
							<ItemTitle>Berkay</ItemTitle>
						</ItemContent>
					</button>
				</Item>
				<Collapsible open>
					<CollapsibleContent>Hidden part</CollapsibleContent>
				</Collapsible>
			</>
		);
		expect(screen.getByRole('status')).toHaveStyle({ width: '24px' });
		expect(screen.getByText('BA')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Berkay' })).toBeInTheDocument();
		expect(screen.getByText('Hidden part')).toBeInTheDocument();
	});
});
