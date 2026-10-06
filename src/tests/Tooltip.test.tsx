import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
	SimpleTooltip,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@src/components/ui/tooltip';

const renderTooltip = () =>
	render(
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>Trigger</TooltipTrigger>
				<TooltipContent>Tooltip text</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);

describe('Tooltip on touch devices', () => {
	beforeEach(() => jest.useFakeTimers());
	afterEach(() => jest.useRealTimers());

	test('opens on a long press and closes a while after release', () => {
		renderTooltip();
		const trigger = screen.getByText('Trigger');

		fireEvent.touchStart(trigger);
		act(() => jest.advanceTimersByTime(699));
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

		act(() => jest.advanceTimersByTime(1));
		expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip text');

		// The tap's click would normally close a Radix tooltip right away
		fireEvent.touchEnd(trigger);
		fireEvent.click(trigger);
		act(() => jest.advanceTimersByTime(1499));
		expect(screen.getByRole('tooltip')).toBeInTheDocument();

		act(() => jest.advanceTimersByTime(1));
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});

	test('a short tap does not open it', () => {
		renderTooltip();
		const trigger = screen.getByText('Trigger');

		fireEvent.touchStart(trigger);
		act(() => jest.advanceTimersByTime(300));
		fireEvent.touchEnd(trigger);
		act(() => jest.advanceTimersByTime(2000));

		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});

	test('SimpleTooltip renders only the child when the title is empty', () => {
		render(
			<TooltipProvider>
				<SimpleTooltip title="">
					<button type="button">Plain</button>
				</SimpleTooltip>
			</TooltipProvider>
		);
		fireEvent.touchStart(screen.getByText('Plain'));
		act(() => jest.advanceTimersByTime(800));
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});
});
