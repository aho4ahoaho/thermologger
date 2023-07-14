<script lang="ts">
	import { onMount } from 'svelte';
	import type { DisplayInfo, ThermoData } from '$lib';
	import Graph from '$lib/components/graph.svelte';
	import Meter from '$lib/components/meter.svelte';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let data: ThermoData[] = [];
	let nowData: ThermoData = {
		time: 0,
		temperature: 0,
		humidity: 0,
		pressure: 0
	};
	let selected: any;
	let selectedData: DisplayInfo = {
		temperature: true,
		humidity: true,
		pressure: true,
		MA_temperature: false,
		MA_humidity: false,
		MA_pressure: false
	};
	let scale: number = 1;
	const URL = env.PUBLIC_API_URL ?? $page.url.origin + '/api';
	let loading = true;

	console.log(URL);

	const getData = async () => {
		const url = scale === 0.5 ? `${URL}/get` : `${URL}/get?scale=${scale}`;
		const res = await fetch(url).then((r) => r.json());
		data = (res.data as ThermoData[]).sort((a, b) => a.time - b.time);
		nowData = data[data.length - 1];
		loading = false;
	};

	onMount(() => {
		getData();
	});

	const handleScaleChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		const value = target.value;
		const s = Number(value);
		if (isNaN(s)) return;
		loading = true;
		scale = s;
		getData();
	};

	const handleDataChange = (e: Event) => {
		loading = true;
		setTimeout(() => {
			loading = false;
		}, 10);
	};

	const handleReloadButton = (e: Event) => {
		loading = true;
		getData();
		setTimeout(() => {
			loading = false;
		}, 10);
	};
</script>

{#if loading === false}
	<Meter data={nowData} />
	<Graph {data} displayInfo={selectedData} />
{:else}
	<Meter/>
	<Graph/>
{/if}
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
	div.displayData {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		div {
			width: 10rem;
		}
	}
	input[type='button'] {
		height: 100%;
		font-size: 1.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #ccc;
		outline: none;
	}
	div.settings {
		width: min(max(80%, 1000px), 100%);
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		> * {
			margin: 0 0.5rem;
		}
		select {
			height: 100%;
			font-size: 1.5rem;
			padding: 0.5rem 1rem;
			border-radius: 0.5rem;
			border: 1px solid #ccc;
			outline: none;
		}
	}
</style>
