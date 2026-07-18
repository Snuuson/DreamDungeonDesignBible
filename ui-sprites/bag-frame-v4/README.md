# Dark Tile-Safe Bag Frame Kit

A simplified rustic frame with dark colors and pattern-free repeatable edges.

## Unity 9-slice

- Source: `bag-frame-9slice.png`
- Size: 1629 x 819 px
- Borders: left/right 147 px; top/bottom 106 px
- Import as `Sprite (2D and UI)`
- Set Image Type to `Sliced`
- Enable `Fill Center`

## Manual tiled renderer

The `pieces/` directory contains four corners plus compact tile samples:

- Horizontal tiles: 128 px wide
- Vertical tiles: 128 px high
- Center tile: 128 x 128 px

The repeatable pieces intentionally avoid stitching, cracks, rivet sequences, and other directional patterns. Inventory cells remain separate child UI elements.

