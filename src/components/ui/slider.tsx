"use client";

import {
	Range as SliderPrimitiveRange,
	Root as SliderPrimitiveRoot,
	Thumb as SliderPrimitiveThumb,
	Track as SliderPrimitiveTrack,
} from "@radix-ui/react-slider";
import type * as React from "react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	...props
}: React.ComponentProps<typeof SliderPrimitiveRoot>) {
	const _values = useMemo(() => {
		if (Array.isArray(value)) {
			return value;
		}
		if (Array.isArray(defaultValue)) {
			return defaultValue;
		}
		return [min, max];
	}, [value, defaultValue, min, max]);

	return (
		<SliderPrimitiveRoot
			className={cn(
				"relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50",
				className
			)}
			data-slot="slider"
			defaultValue={defaultValue}
			max={max}
			min={min}
			value={value}
			{...props}
		>
			<SliderPrimitiveTrack
				className={cn(
					"relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5"
				)}
				data-slot="slider-track"
			>
				<SliderPrimitiveRange
					className={cn(
						"absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
					)}
					data-slot="slider-range"
				/>
			</SliderPrimitiveTrack>
			{_values.map((val) => (
				<SliderPrimitiveThumb
					className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
					data-slot="slider-thumb"
					key={val}
				/>
			))}
		</SliderPrimitiveRoot>
	);
}

export { Slider };
