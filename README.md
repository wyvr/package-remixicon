# wyvr package for remixicon

Package to easily integrate remixicon in your wyvr project.

## Getting started

Place the tag in your desired doc, inside teh head tag to integrate it.

```
<script>
    import RemixiconInclude from '@src/component/remixicon/Include.svelte';
</script>

<head>
    <RemixiconInclude />
</head>
```html

> When the global value `global.env` is equal to **prod** the package automatically integrate the minified css version.  