<script lang="ts">
	import type { ThermoData } from '$lib';
	export let data: ThermoData|null=null;

	let frame: HTMLDivElement;
</script>

<div bind:this={frame}>
	{#if data != null}
		<p>{data.temperature.toFixed(1)}°C</p>
		<p>{data.humidity.toFixed(1)}%</p>
		<p>{(data.pressure / 100).toFixed(0)}hPa</p>
	{:else}
		<p>loading</p>
	{/if}
</div>

<style>
	div {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}
	p {
		flex-grow: 1;
		flex-basis: 200px;
		margin: 0;
		font-size: 3rem;
		text-align: center;
	}
</style>
