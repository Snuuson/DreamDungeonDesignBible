# Rustic Bag Frame Sprite Kit

A practical 9-slice backdrop with rounded convex corners, worn leather, and restrained aged-metal ornaments.

## Unity setup

- Source sprite: `bag-frame-9slice.png`
- Trimmed dimensions: 1535 x 814 px
- Sprite Editor borders:
  - Left / Right: 138 px
  - Top / Bottom: 106 px
- Import as `Sprite (2D and UI)`
- Set the UI Image type to `Sliced`
- Keep `Fill Center` enabled

The inner content area remains a simple rounded rectangle. Add a child content container with uniform padding and generate bag cells separately.

The `pieces/` directory contains the four corners, four edges, and center as individual PNG sprites.

