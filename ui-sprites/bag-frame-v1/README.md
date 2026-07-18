# Bag Frame Sprite Kit

Generated from the Dream Dungeon bag-frame art direction.

## Unity 9-slice source

- Sprite: `bag-frame-9slice.png`
- Trimmed size: 1300 x 732 px
- Suggested Sprite Editor borders:
  - Left: 143
  - Right: 143
  - Top: 102
  - Bottom: 102
- Import as: Sprite (2D and UI)
- UI Image type: Sliced
- Fill Center: enabled

## Individual regions

The `pieces/` folder contains:

- `top-left.png`
- `top.png`
- `top-right.png`
- `left.png`
- `center.png`
- `right.png`
- `bottom-left.png`
- `bottom.png`
- `bottom-right.png`

Use the single 9-slice source for normal Unity UI work. The extracted pieces are provided for custom renderers, atlases, tiled edges, or manual layout systems.

Inventory cells are intentionally excluded. Place a padded content container over the center and generate slot prefabs independently.

