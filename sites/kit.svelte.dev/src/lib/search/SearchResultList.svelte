<script>
	import { createEventDispatcher } from 'svelte';

	/** @type {import('./types').Tree[]} */
	export let results;

	/** @type {string} */
	export let query;

	const dispatch = createEventDispatcher();

	function escape(text) {
		return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function excerpt(content, query) {
		const index = content.toLowerCase().indexOf(query.toLowerCase());
		if (index === -1) {
			return content.slice(0, 100);
		}

		const prefix = index > 20 ? `…${content.slice(index - 15, index)}` : content.slice(0, index);
		const suffix = content.slice(
			index + query.length,
			index + query.length + (80 - (prefix.length + query.length))
		);

		return (
			escape(prefix) +
			`<mark>${escape(content.slice(index, index + query.length))}</mark>` +
			escape(suffix)
		);
	}
</script>

<ul>
	{#each results as result, i}
		<li>
			<a
				href={result.href}
				on:click={() => dispatch('select', { href: result.href })}
				data-has-node={result.node ? true : undefined}
			>
				<strong>{@html excerpt(result.breadcrumbs.at(-1), query)}</strong>

				{#if result.node?.content}
					<span>{@html excerpt(result.node.content, query)}</span>
				{/if}
			</a>

			{#if result.children.length > 0}
				<svelte:self results={result.children} {query} on:select />
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		position: relative;
		margin: 0;
	}

	ul :global(ul) {
		margin-left: 0.8em !important;
		padding-left: 0em;
		border-left: 1px solid #eee;
	}

	li {
		list-style: none;
		margin-bottom: 1em;
	}

	li:last-child {
		margin-bottom: 0;
	}

	ul ul li {
		margin: 0;
	}

	a {
		display: block;
		text-decoration: none;
		line-height: 1;
		padding: 1rem;
	}

	a:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	a:focus {
		background: var(--second);
		color: white;
		outline: none;
	}

	a strong,
	a span {
		display: block;
		white-space: nowrap;
		line-height: 1;
	}

	a strong {
		font-size: 1.6rem;
		color: var(--text);
	}

	a span {
		font-size: 1.2rem;
		color: #999;
		overflow: hidden;
		text-overflow: ellipsis;
		margin: 0.4rem 0 0 0;
	}

	a :global(mark) {
		--highlight-color: rgba(255, 255, 0, 0.2);
	}

	a span :global(mark) {
		background: none;
		color: #111;
		background: var(--highlight-color);
		outline: 2px solid var(--highlight-color);
		border-top: 2px solid var(--highlight-color);
		mix-blend-mode: darken;
	}

	a:focus span {
		color: rgba(255, 255, 255, 0.6);
	}

	a:focus strong {
		color: white;
	}

	a:focus span :global(mark),
	a:focus strong :global(mark) {
		--highlight-color: hsl(240, 8%, 54%);
		mix-blend-mode: lighten;
		color: white;
	}

	a strong :global(mark) {
		color: black;
		background: var(--highlight-color);
		outline: 2px solid var(--highlight-color);
		/* border-top: 2px solid var(--highlight-color); */
		border-radius: 1px;
	}
</style>
