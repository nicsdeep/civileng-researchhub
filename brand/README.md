# Brand

- `logo-original.png`: the official CivilEng ResearchHub artwork (arch bridge over an open book).
- `../public/logo-mark.svg`: vector version used in the header and footer, traced from the original
  with `trace-logo.py` (navy `#072c58`, teal `#039694`, sampled from the artwork).
- `../public/favicon.svg`: the mark on a white rounded tile, so it stays visible on dark browser tabs.
- `../public/apple-touch-icon.png`, `favicon-32.png`, `icon-512.png`: PNG renders of the favicon.

Regenerate the SVG: `pip install potracer pillow numpy && python3 brand/trace-logo.py brand/logo-original.png public/logo-mark.svg`
(then rebuild the favicon from the paths). In dark mode the site places the mark on a white tile
so its colours are never altered.
