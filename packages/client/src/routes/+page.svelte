<script lang="ts">
	import { onMount } from 'svelte';
	import type { DisplayInfo, ThermoData } from '$lib';
	import Graph from '$lib/components/graph.svelte';
	import Meter from '$lib/components/meter.svelte';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';

	let data: ThermoData[] = [];
	let nowData: ThermoData | null = null;
	let selected: object;
	let selectedData: DisplayInfo = {
		temperature: true,
		humidity: true,
		pressure: true,
		MA_temperature: false,
		MA_humidity: false,
		MA_pressure: false,
		Abs_humidity: false
	};
	let scale = 1;
	const URL = env.PUBLIC_API_URL ?? $page.url.origin + '/api';
	let graphComponent: Graph | undefined;

	const getData = async () => {
		const url = scale === 0.5 ? `${URL}/get` : `${URL}/get?scale=${scale}`;
		const res = await fetch(url).then((r) => r.json());
		data = (res.data as ThermoData[]).sort((a, b) => a.time - b.time);
		nowData = data.length !== 0 ? data[data.length - 1] : null;
		graphComponent?.reload(data);
	};

	onMount(() => {
		getData();
	});

	const handleScaleChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		const value = target.value;
		const s = Number(value);
		if (isNaN(s)) return;
		scale = s;
		getData();
	};

	const handleDataChange = () => {
		graphComponent?.reload();
	};

	const handleReloadButton = async () => {
		getData();
	};
</script>

<Meter data={nowData} />
<Graph {data} displayInfo={selectedData} bind:this={graphComponent} />
<div class="settings">
	<div class="displayData">
		<div>
			<input
				type="checkbox"
				id="Tempture"
				bind:checked={selectedData.temperature}
				on:change={handleDataChange}
			/>
			<label for="Tempture">Temperature</label>
		</div>
		<div>
			<input
				type="checkbox"
				id="Humidity"
				bind:checked={selectedData.humidity}
				on:change={handleDataChange}
			/>
			<label for="Humidity">Humidity</label>
		</div>
		<div>
			<input
				type="checkbox"
				id="Pressure"
				bind:checked={selectedData.pressure}
				on:change={handleDataChange}
			/>
			<label for="Pressure">Pressure</label>
		</div>
		<div>
			<input
				type="checkbox"
				id="MA_Tempture"
				bind:checked={selectedData.MA_temperature}
				on:change={handleDataChange}
			/>
			<label for="MA_Tempture">MA_Temperature</label>
		</div>
		<div>
			<input
				type="checkbox"
				id="MA_Humidity"
				bind:checked={selectedData.MA_humidity}
				on:change={handleDataChange}
			/>
			<label for="MA_Humidity">MA_Humidity</label>
		</div>
		<div>
			<input
				type="checkbox"
				id="MA_Pressure"
				bind:checked={selectedData.MA_pressure}
				on:change={handleDataChange}
			/>
			<label for="MA_Pressure">MA_Pressure</label>
		</div>
		<div>
			<input
				type="checkbox"
				id="Abs_humidity"
				bind:checked={selectedData.Abs_humidity}
				on:change={handleDataChange}
			/>
			<label for="Abs_humidity">Abs_humidity</label>
		</div>
	</div>
	<div>
		<input type="button" value="reload" on:click={handleReloadButton} />
	</div>
	<div>
		<select name="scale" bind:value={selected} on:change={handleScaleChange}>
			<option value="0.5">30 minutes</option>
			<option value="1" selected>1 hour</option>
			<option value="3">3 hour</option>
			<option value="6">6 hour</option>
			<option value="12">12 hour</option>
			<option value="24">1 days</option>
			<option value="48">2 days</option>
			<option value="72">3 days</option>
			<option value="168">7 days</option>
		</select>
	</div>
</div>

<style lang="scss">
	div.settings {
		width: min(max(80%, 1000px), 100%);
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		> * {
			margin: 0 0.5rem;
		}

		div.displayData {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
			flex: 1;
			flex-shrink: 0;
			flex-basis: 200px;
			div {
				width: 10rem;
			}
		}
		> div:not(.displayData) {
			min-width: 200px;
			> * {
				width: 100%;
				height: 100%;
				text-align: center;
				font-size: 1.5rem;
				padding: 0.5rem 0;
				border-radius: 0.5rem;
				border: 1px solid #ccc;
				outline: none;
			}
		}
	}
</style>
