<script>
    import Stylesheet from '@src/component/Stylesheet.svelte';
    const use_shrinked = getGlobal('global.env', 'dev') == 'prod';
</script>

{#if use_shrinked}
    <Stylesheet src="/assets/remixicon/remixicon.used.css" />
{:else}
    <Stylesheet src="/assets/remixicon/remixicon.css" />
{/if}
