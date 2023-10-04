<script lang="ts">
	import {
		strokeGraph,
		graphDataGenerator,
		type ThermoData,
		type DisplayInfo,
	} from '$lib';
	import { onMount } from 'svelte';

	export let data: ThermoData[] = [];
	export let displayInfo: DisplayInfo = {
		temperature: true
	};
	//element
	let canvas: HTMLCanvasElement | undefined;
	let frame: HTMLDivElement | undefined;
	let innerWidth = 0;

	//data
	let leftScale: string[] = ['0℃', '99.9℃'];
	let rightScale: string[] = ['0%', '99%'];
	let xScale: string[] = ['0:00', '24:00'];

	export const reload = async(newdata: ThermoData[] = data) => {
		if (!canvas || !frame) return;
		if (canvas.width != null && canvas.height != null) {
			canvas.width = 0;
			canvas.height = 0;
		}
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		if (newdata.length === 0) {
			canvas.width = frame.clientWidth;
			canvas.height = frame.clientHeight;
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			return;
		}

		leftScale =
			displayInfo.temperature || displayInfo.MA_temperature
				? scaleGenNum(
						newdata.map((d) => d.temperature),
						1,
						'℃'
				  )
				: [];
		rightScale =
			displayInfo.humidity || displayInfo.MA_humidity
				? scaleGenNum(
						newdata.map((d) => d.humidity),
						0,
						'%'
				  )
				: [];
		xScale = scaleGenDate(new Date(newdata[0].time), new Date(newdata[newdata.length - 1].time));

		await new Promise((resolve) => setTimeout(resolve, 1));

		canvas.width = frame.clientWidth;
		canvas.height = frame.clientHeight;

		const width = canvas.width;
		const height = canvas.height;
		const offset = 10;
		const fontSize = height / 30;

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);
		ctx.font = `${fontSize}px bold Arial`;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.lineWidth = 1;
		const scaleStep = 10;

		//draw grid
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

		const viewData = graphDataGenerator(newdata, displayInfo);

		// draw lines
		viewData.forEach(({ color, data, range }) => {
			ctx.strokeStyle = color;
			canvas && strokeGraph(canvas, data, range);
		});

		// draw labels
		viewData.forEach(({ label, color }, i) => {
			ctx.fillStyle = 'white';
			const { width } = ctx.measureText(label);
			ctx.fillRect(offset, fontSize * i + offset, width, fontSize);
			ctx.fillStyle = color;
			ctx.fillText(label, offset, fontSize * i + offset);
		});
	};

	const scaleGenNum = (data: number[], digits = 1, Unit = ''): string[] => {
		if (data.length === 0) return [];
		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min;
		const step = range / 10;
		let scale = [];
		for (let i = 0; i <= 10; i++) {
			scale.push(min + step * i);
		}
		if ((frame?.clientHeight ?? 0) < 300) {
			scale = scale
				.map((s, i) => (i % 5 === 0 ? s : undefined))
				.filter((s) => s !== undefined) as number[];
		}
		scale = scale.map((s) => s.toFixed(digits) + Unit);
		scale = Array.from(new Set(scale));
		if (scale.length === 1) {
			scale = [scale[0], scale[0]];
		}

		return scale;
	};
	const scaleGenDate = (start: Date, end: Date): string[] => {
		const scale = [];
		const range = end.getTime() - start.getTime();
		const step = range / 10;
		for (let i = 0; i <= 10; i++) {
			const date = new Date(start.getTime() + step * i);
			scale.push(date.getHours().toString() + ':' + date.getMinutes().toString().padStart(2, '0'));
		}
		if (innerWidth < 600) {
			return scale.map((s, i) => (i % 5 === 0 ? s : '')).filter((s) => s !== '');
		}
		if (innerWidth < 1000) {
			return scale.map((s, i) => (i % 2 === 0 ? s : '')).filter((s) => s !== '');
		}
		return scale;
	};

	onMount(reload);
</script>

<svelte:window
	on:resize={() => {
		reload();
	}}
	bind:innerWidth
/>
<div class="container">
	{#if leftScale.length > 0}
		<div class="Yaxis">
			{#each leftScale.reverse() as scale}
				<p>{scale}</p>
			{/each}
		</div>
	{/if}
	<div class="graph_frame">
		<div class="dummy" />
		<div bind:this={frame} class="graph">
			<canvas bind:this={canvas} />
		</div>
		{#if xScale.length > 0}
			<div class="Xaxis">
				{#each xScale as scale}
					<p>{scale}</p>
				{/each}
			</div>
		{/if}
	</div>
	{#if rightScale.length > 0}
		<div class="Yaxis">
			{#each rightScale.reverse() as scale}
				<p>{scale}</p>
			{/each}
		</div>
	{/if}
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
	div.Yaxis {
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
		width: 0;
		flex-grow: 1;
		height: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: 0 0.5rem;
		div.graph {
			flex: 1;
		}
		div.dummy {
			height: 1rem;
		}
	}

	div.Xaxis {
		width: 100%;
		display: flex;
		justify-content: space-between;
		box-sizing: border-box;
		p {
			flex-basis: fit-content;
			margin: 0;
			text-align: center;
			user-select: none;
			text-overflow: ellipsis;
		}
	}

	canvas {
		box-sizing: border-box;
		border: 1px solid black;
	}
</style>
