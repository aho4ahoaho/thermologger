<script lang="ts">
	import {
		strokeGraph,
		graphDataGenerator,
		type ThermoData,
		type DisplayInfo,
		type ViewData
	} from '$lib';
	import { onMount } from 'svelte';

	export let data: ThermoData[]=[];
	export let displayInfo: DisplayInfo = {
		temperature: true,
		humidity: true,
		pressure: true,
		MA_temperature: true,
		MA_humidity: true,
		MA_pressure: true
	};

	let canvas: HTMLCanvasElement;
	let frame: HTMLDivElement;
	let leftScale: HTMLDivElement;
	let rightScale: HTMLDivElement;
	let yScale: HTMLDivElement;

	const viewData: ViewData[] = graphDataGenerator(data, displayInfo);

	const resize = () => {
		if (!canvas) return;
		if (canvas.width != null && canvas.height != null) {
			canvas.width = 0;
			canvas.height = 0;
		}
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		if (data.length === 0) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			return;
		}
		resetScale();
		setXScale(
			data.map((d) => d.temperature),
			{ Unit: '°C', digits: 1, target: 'left' }
		);
		setXScale(
			data.map((d) => d.humidity),
			{ Unit: '%', digits: 0, target: 'right' }
		);
		setYScale(
			data.map((d) => d.time),
			{ Unit: 'h', digits: 1 }
		);
		/*setXScale(
			data.map((d) => d.pressure),
			{ Unit: 'hPa', digits: 0 }
		);*/
		const width = frame.clientWidth;
		const height = frame.clientHeight;
		const offset = 10;
		const fontSize = height / 30;

		canvas.width = width;
		canvas.height = height;

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);
		ctx.font = `${fontSize}px bold Arial`;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.lineWidth = 1;
		const scaleStep = 10;

		//draw scale
		ctx.strokeStyle = 'rgba(0,0,0,0.25)';
		for (let i = 0; i < scaleStep; i++) {
			ctx.beginPath();
			ctx.moveTo(0, (height / scaleStep) * i);
			ctx.lineTo(width, (height / scaleStep) * i);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo((width / scaleStep) * i, 0);
			ctx.lineTo((width / scaleStep) * i, height);
			ctx.stroke();
			ctx.closePath();
		}

		// draw lines
		viewData.forEach(({ label, color, data, range }, i) => {
			ctx.strokeStyle = color;
			strokeGraph(canvas, data, range);
		});

		// draw labels
		viewData.forEach(({ label, color, data }, i) => {
			ctx.fillStyle = 'white';
			const { width } = ctx.measureText(label);
			ctx.fillRect(offset, fontSize * i + offset, width, fontSize);
			ctx.fillStyle = color;
			ctx.fillText(label, offset, fontSize * i + offset);
		});
	};

	const setXScale = (
		data: number[],
		options: { Unit?: string; digits?: number; target?: 'left' | 'right' } = {}
	) => {
		const target = options.target !== 'right' ? leftScale : rightScale;
		const [upper, middle, lower] = target.children;
		const { Unit, digits } = options;
		if (!upper || !middle || !lower) return;
		const max = Math.max(...data);
		const min = Math.min(...data);
		upper.textContent += max.toFixed(digits ?? 1) + (Unit ?? '');
		middle.textContent += ((max + min) / 2).toFixed(digits ?? 1) + (Unit ?? '');
		lower.textContent += min.toFixed(digits ?? 1) + (Unit ?? '');
	};

	const setYScale = (data: number[], options: { Unit?: string; digits?: number } = {}) => {
		const [upper, middle, lower] = yScale.children;
		const { Unit, digits } = options;
		const start = new Date(data[0]);
		const end = new Date(data[data.length - 1]);
		const range = (end.getTime() - start.getTime()) / 2 / 1000 / 1800;

		upper.textContent += '-' + range.toFixed(digits ?? 1) + (Unit ?? '');
		middle.textContent += '-' + (range / 2).toFixed(digits ?? 1) + (Unit ?? '');
		lower.textContent += '0' + (Unit ?? '');
	};

	const resetScale = () => {
		[leftScale, rightScale, yScale].forEach((scale) => {
			const [upper, middle, lower] = scale.children;
			if (!upper || !middle || !lower) return;
			upper.textContent = '';
			middle.textContent = '';
			lower.textContent = '';
		});
	};

	onMount(resize);
</script>
<svelte:window on:resize={resize} />
<div class="container">
	<div class="Xaxis" bind:this={leftScale}>
		<p>upper</p>
		<p>middle</p>
		<p>lower</p>
	</div>
	<div class="graph_frame">
		<div class="dummy" />
		<div bind:this={frame} class="graph">
			<canvas bind:this={canvas} />
		</div>
		<div class="Yaxis" bind:this={yScale}>
			<p>start</p>
			<p>center</p>
			<p>end</p>
		</div>
	</div>
	<div class="Xaxis" bind:this={rightScale}>
		<p>upper</p>
		<p>middle</p>
		<p>lower</p>
	</div>
</div>

<style lang="scss">
	div.container {
		width: min(max(80%, 1000px), 100%);
		margin: 0 auto;
		height: 50vmin;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	div.Xaxis {
		width: max-content;
		height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-bottom: 1.5rem;
		p {
			margin: 0;
			padding: 0;
			text-align: center;
			user-select: none;
		}
	}
	div.graph_frame {
		flex: 1;
		height: 100%;

		display: flex;
		flex-direction: column;
		div.graph {
			width: 100%;
			flex: 1;
		}
		div.dummy {
			height: 1rem;
		}
	}
	div.Yaxis {
		width: 100%;
		display: flex;
		justify-content: space-between;
		box-sizing: border-box;
		p {
			margin: 0;
			text-align: center;
			user-select: none;
		}
	}
	canvas {
		box-sizing: border-box;
		border: 1px solid black;
	}
</style>
