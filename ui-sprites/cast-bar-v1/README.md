# Cast Bar Sprite Kit

Dark rustic cast-bar assets matching the bag-frame UI family.

## Assets

- `cast-bar-frame.png` — empty frame and recessed track (2026 x 118 px)
- `cast-bar-fill.png` — separate Arcane Teal progress fill (1590 x 76 px)
- `pieces/` — left caps, center tiles, and right caps for both elements

## Layout

Place the fill behind or inside the frame and control its width from the cast progress value. Keep spell text, timer text, and an optional spell icon as separate UI children.

### Frame

- Left/right fixed cap width: 85 px
- Center tile width: 128 px

### Fill

- Left/right fixed cap width: 42 px
- Center tile width: 128 px

The center pieces contain no horizontal pattern and may be tiled or stretched.

