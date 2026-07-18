# Practical Bag Frame Sprite Kit

This variant prioritizes a rectangular inventory grid and efficient usable space.

## Unity 9-slice source

- Sprite: `bag-frame-9slice.png`
- Trimmed size: 1534 x 838 px
- Suggested Sprite Editor borders:
  - Left: 115
  - Right: 115
  - Top: 92
  - Bottom: 92
- Import as: Sprite (2D and UI)
- UI Image type: Sliced
- Fill Center: enabled

The inner content boundary is designed to remain rectangular. Overlay a content container with uniform padding and generate inventory slot prefabs independently.

## Individual regions

The `pieces/` directory contains the four corners, four edges, and center as separate PNG sprites for custom renderers or atlases.

