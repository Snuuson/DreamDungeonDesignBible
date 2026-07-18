# Local gameplay-SFX workspace

This file is the durable handoff for agents working on local audio generation and sound design for the game. Read it before changing the audio index, recipes, or rendered SFX.

Last verified: 2026-07-13.

## Environment and important paths

- Host: Windows with WSL2 Ubuntu.
- ComfyUI: `/home/snuu/comfyui`.
- Stable Audio workspace: `/home/snuu/audio-generation/stable-audio-3`.
- Python: `/home/snuu/audio-generation/stable-audio-3/.venv/bin/python`.
- FFmpeg is installed in WSL and includes the `rubberband` filter for pitch/time processing.
- Main game-audio collection on Windows: `C:\Users\Sebas\GameDev\Assets\Audio`.
- The same collection from WSL: `/mnt/c/Users/Sebas/GameDev/Assets/Audio`.
- VSCO 2 CE: `/home/snuu/audio-generation/stable-audio-3/library/cc0_sources/vsco2_ce`.
- WoW level-up stylistic reference: `/home/snuu/audio-generation/stable-audio-3/references/wow_levelup_reference.ogg`. Analyze its structure and feel only; do not reproduce it closely.

## Unified searchable audio index

- Indexer/analyzer: `/home/snuu/audio-generation/stable-audio-3/tools/audio_library_index.py`.
- SQLite database: `/home/snuu/audio-generation/stable-audio-3/library/audio_index.sqlite3`.
- Pre-game-assets backup: `/home/snuu/audio-generation/stable-audio-3/library/audio_index.pre_game_assets.sqlite3`.
- Last verified coverage: 4,319 indexed files, 4,319 analyzed files, zero analysis errors, SQLite integrity `ok`.
- Acoustic analysis version: `signal-v2`.
- Stored measurements include amplitude/dynamics, onset/attack/decay, active duration, transient count, spectral bands/centroid/rolloff/flatness, pitch/confidence, stereo correlation/width, silence/clipping, SHA-256, and spectral fingerprints.
- Search supports text plus acoustic filters and rights filters such as `--cc0-only`, `--ship-safe-only`, `--usage-class`, and `--collection`.

Typical commands:

```bash
cd ~/audio-generation/stable-audio-3

# Refresh the Windows gameplay-audio tree without replacing VSCO.
.venv/bin/python tools/audio_library_index.py import-assets \
  /mnt/c/Users/Sebas/GameDev/Assets/Audio

# Analyze only new or changed files.
.venv/bin/python tools/audio_library_index.py analyze --workers 4

# Example search.
.venv/bin/python tools/audio_library_index.py search "magic impact" \
  --analyzed-only --ship-safe-only --max-duration 5
```

Do not casually run `audio_library_index.py build`: it atomically replaces the database with the single supplied root. If a rebuild is genuinely required, rebuild VSCO, run `import-assets`, then run `analyze` again. Prefer the incremental commands above.

The importer intentionally ignores archives, `_tools`, `__MACOSX`, `._*` metadata stubs, and lower-quality TomMusic OGG files when matching WAV files exist. Do not index those as additional sounds.

## Rights and usage boundaries

Rights metadata is stored in `audio_provenance` and copied into SFX render manifests. Preserve it on every new workflow.

- VSCO 2 Community Edition: CC0.
- Kenney: CC0.
- Epic Stock Media `Fantasy Game`: licensed for embedding in a game; no redistribution and no AI training.
- Sonniss GDC material: licensed/royalty-free; no AI training.
- TomMusic, `spells`, `SoundEffects`, and loose root files: terms missing or mixed; verify before shipping.
- Last verified classes: 3,406 CC0, 624 licensed, 289 requiring verification. These counts can change after imports.

Local signal analysis and ordinary game-sound layering are not model training. Never use sources marked `ai_training_allowed = 0` to train or fine-tune a model. Do not redistribute licensed raw sources. Use `--cc0-only` whenever unrestricted source material is required.

## JSON recipe-based sound construction

The JSON recipe is the source of truth for every constructed effect. Do not create another hard-coded one-off renderer.

- Generic renderer: `/home/snuu/audio-generation/stable-audio-3/tools/sfx_recipe.py`.
- Format documentation: `/home/snuu/audio-generation/stable-audio-3/recipes/README.md`.
- JSON schema: `/home/snuu/audio-generation/stable-audio-3/recipes/sfx_recipe.schema.json`.
- Canonical level-up recipe: `/home/snuu/audio-generation/stable-audio-3/recipes/levelup_single_impact.recipe.json`.
- Layer cache: `/home/snuu/audio-generation/stable-audio-3/.sfx_cache/<cache-group>/`.

Recipe layers control source, trim, timeline position, gain, pitch shift, time stretch, stereo width, ordered EQ, fades, gain automation, exponential decay, phase, rights, and reverb send. Recipes also control the deterministic reverb bus, master EQ/width/fades, look-ahead limiter, peak normalization, WAV format, OGG preview, duration, and sample rate.

Render commands:

```bash
cd ~/audio-generation/stable-audio-3

.venv/bin/python tools/sfx_recipe.py validate \
  recipes/levelup_single_impact.recipe.json

.venv/bin/python tools/sfx_recipe.py render \
  recipes/levelup_single_impact.recipe.json

# Use only when deliberately bypassing all processed-layer caches.
.venv/bin/python tools/sfx_recipe.py render \
  recipes/levelup_single_impact.recipe.json --no-cache
```

The cache key includes engine version, source size/mtime, sample rate, and all signal-processing fields. Mix-only fields (`id`, `role`, `rights`, timeline position, layer gain, and reverb send) do not invalidate the processed-layer cache. Recipes can set `cache_group` so controlled variants reuse common layers. Editing a DSP field reprocesses only that layer. The verified level-up render takes about 20 seconds uncached and about 2.6 seconds fully cached.

Every render writes a `.render.json` provenance manifest containing the recipe hash, source hashes, rights, paths, cache use, render time, output profile label, and basic output measurements. Never omit or detach this manifest from a deliverable.

The old `/home/snuu/audio-generation/stable-audio-3/tools/render_levelup_library_sample.py` is only a compatibility wrapper and now calls the canonical recipe.

## Objective reference comparison

- Comparison tool: `/home/snuu/audio-generation/stable-audio-3/tools/sfx_compare.py`.
- Global comparison history: `/home/snuu/audio-generation/stable-audio-3/outputs/comparisons/history.jsonl`.
- The tool decodes both sounds at 48 kHz, preserves mono amplitude before duplicating it for analysis, aligns plots at the strongest 50 ms RMS-novelty event, and keeps structural comparison separate from copying.
- Reports measure loudness contour, peak/RMS/crest, onset/build/active/tail timing, broadband transient timestamps, stricter low-pressure-event timestamps, bright-bloom timing, time-varying spectral bands/centroid, stereo correlation/width, and mono compatibility.
- Supplying `--recipe` enables layer-role-specific recommendations. Recommendations are evidence for a new recipe version, not automatic edits.
- Every run writes JSON, a PNG dashboard, and a self-contained HTML report. Unique audio/recipe hash combinations are appended once to history.

Command:

```bash
cd ~/audio-generation/stable-audio-3

.venv/bin/python tools/sfx_compare.py \
  references/wow_levelup_reference.ogg \
  outputs/levelup_library_v1/01_levelup_single_impact.wav \
  --recipe recipes/levelup_single_impact.recipe.json
```

The first level-up report is under:

`/home/snuu/audio-generation/stable-audio-3/outputs/levelup_library_v1/comparisons/01_levelup_single_impact_vs_wow_levelup_reference/`

Key first-report findings:

- Candidate is about 10.7 dB lower in full-file RMS and 2.82 times peakier than the reference. The reference is heavily limited and decodes to about +0.66 dBFS, so do not copy its clipping.
- Candidate centroid is about 532 Hz versus 212 Hz and is therefore substantially brighter/less dark.
- Candidate 20-160 Hz energy share is about 54.7% versus 86.2% in the reference.
- Candidate active tail after impact is about 1.96 seconds shorter.
- Candidate bright-energy peak is about 0.62 seconds earlier relative to the main impact.
- Candidate has exactly one perceptually significant low-frequency pressure event; preserve this user requirement.
- Reference is mono while the candidate is stereo. Preserve stereo and check the reported mono compatibility rather than matching mono.

## Reference deconstruction and layer blueprints

- Deconstruction tool: `/home/snuu/audio-generation/stable-audio-3/tools/sfx_deconstruct.py`.
- Current level-up report: `/home/snuu/audio-generation/stable-audio-3/outputs/deconstructions/wow_levelup_reference/index.html`.
- Machine-readable blueprint: `/home/snuu/audio-generation/stable-audio-3/outputs/deconstructions/wow_levelup_reference/layer_blueprint.json`.
- Runs are registered in the unified database table `sfx_reference_deconstructions` by source hash and tool version.

The tool does not claim to recover original production stems. It creates deterministic diagnostic hypotheses using complementary soft frequency masks, median time-frequency separation, temporal landmarks, and the existing objective reference analyzer. Output includes:

- Four complementary frequency-role stems: pressure, body, presence, and detail.
- Two complementary signal-character stems: tonal and transient/texture.
- Solo clips for the impact, sustain, bloom, and tail windows.
- A five-role recipe blueprint: pressure impact, resonant body, tonal sustain, bright bloom, and reverberant tail.
- Five ship-safe local source suggestions per inferred role, ranked from the unified audio index.
- A self-contained HTML report with synchronized solo/mute mixers and a JSON blueprint.

Command:

```bash
cd ~/audio-generation/stable-audio-3

.venv/bin/python tools/sfx_deconstruct.py \
  references/wow_levelup_reference.ogg \
  --output-dir outputs/deconstructions/wow_levelup_reference
```

The current reference produces a 0.04-second impact, 0.66-second bright bloom, 2.15-second decay start, and 3.72-second active end. Frequency and signal-character stems reconstruct the gain-normalized source at 119.3 dB and 142.3 dB SNR respectively. High reconstruction SNR only proves the masks are complementary; it does not prove semantic stem recovery.

All extracted diagnostic audio must remain local. Never ship it, redistribute it, train on it, or use it as source material. Use the blueprint to rebuild functional roles from licensed or CC0 sources. An audition config may set `reference_deconstruction`; the builder exposes the report through a **Reference layers** button and a local symlink inside the board.

## Blind audition and rating system

- Builder/server: `/home/snuu/audio-generation/stable-audio-3/tools/sfx_audition.py`.
- Current refinement set: `/home/snuu/audio-generation/stable-audio-3/auditions/levelup_v5_orchestral.audition.json`.
- Generated board: `/home/snuu/audio-generation/stable-audio-3/outputs/auditions/levelup_v5_orchestral/index.html`.
- Local rating URL while the server is running: `http://127.0.0.1:8765/`.
- Ratings use the unified SQLite database and the `sfx_audition_sets`, `sfx_audition_candidates`, and `sfx_audition_ratings` tables.

An audition config points to a base recipe and expresses every candidate as a small list of path/value patches. Patch paths can address recipe layers by stable id, for example `/layers@deep_foundation/eq/1/gain_db`. Builds create resolved recipes, untouched WAV masters, gain-only normalized OGG previews, waveform SVGs, per-candidate reference reports, a manifest, and a blind HTML board. The board includes a gain-matched reference player above the candidates and can link its layer-deconstruction report. Design labels remain hidden until explicitly revealed.

Preview normalization uses active RMS and a peak ceiling. Always verify `metrics.normalization.preview_active_rms_dbfs` and `reference_preview.normalization.preview_active_rms_dbfs` in `audition_manifest.json`; the reference and all five `levelup_v5_orchestral` previews were verified at exactly -23.0 dBFS active RMS. Masters are never normalized for the board.

Commands:

```bash
cd ~/audio-generation/stable-audio-3

# Rebuild candidates and reports while preserving any existing user ratings.
.venv/bin/python tools/sfx_audition.py build \
  auditions/levelup_v5_orchestral.audition.json

# Serve the board and persist ratings. Keep localhost binding unless LAN access is explicitly wanted.
.venv/bin/python tools/sfx_audition.py serve \
  outputs/auditions/levelup_v5_orchestral --host 127.0.0.1 --port 8765
```

If WSL localhost forwarding is unavailable, run the Linux server on `0.0.0.0:8766`, then run `/home/snuu/audio-generation/stable-audio-3/tools/wsl_tcp_forward.py` with Windows Python on `127.0.0.1:8765`, targeting the current WSL IP on port 8766. This keeps SQLite access native to Linux. Never serve with Windows Python while opening the SQLite database through `\\wsl.localhost`; SQLite writes over that network share can hang.

The retired `levelup_v2` set varied a structurally wrong base and should not be used for decisions. The `levelup_v3` set corrected the macro structure but moved into small mix variations too early; retain it as a technical comparison. The completed `levelup_v4_wide` exploration spanned eight dominant source families and verified one pressure event across all candidates. User ratings selected candidate C, pure orchestral triumph, with score 4/rank 1 and tags `clean`, `bombastic`, `too short`, and `best`. The meditative direction was a distant second at score 2/rank 2 with an abrupt-start note; all other directions scored 1-2 and were discarded.

The current `levelup_v5_orchestral` refinement set contains the exact winner control plus long-hall, denser-long, sustained-brass, and smoothly introduced spiritual-hybrid variants. The four refinements extend active tail from 2.88 seconds to roughly 4.0-4.1 seconds. All retain one low-pressure event. Do not reveal identities before the user has listened if preserving a blind judgment matters. Ratings support 1-5 score, rank, tags, and notes, and can be exported from the board as JSON.

## Current level-up effect

- Recipe: `/home/snuu/audio-generation/stable-audio-3/recipes/levelup_orchestral_v5.recipe.json`.
- WAV: `/home/snuu/audio-generation/stable-audio-3/outputs/levelup_orchestral_v5/01_levelup_orchestral_v5.wav`.
- OGG preview: `/home/snuu/audio-generation/stable-audio-3/outputs/levelup_orchestral_v5/01_levelup_orchestral_v5_preview.ogg`.
- Manifest: `/home/snuu/audio-generation/stable-audio-3/outputs/levelup_orchestral_v5/01_levelup_orchestral_v5.render.json`.
- Output: stereo, 48 kHz, 24-bit PCM WAV, peak-normalized to -1 dBFS.
- Design: clean and bombastic mostly acoustic brass-and-gong reward impact with trombone body, low tuba/horn foundation, delayed magical confirmation, hall tail, and exactly one low-pressure event.
- This exact wide-round winner has a 2.88-second active tail and is retained as control. The active refinement board tests four ways to address the user's `too short` tag without losing its identity.
- Historical macro correction remains relevant: normalized RMS-envelope correlation improved from 0.394 for the retired recipe to 0.898 before the wide exploration began.

User preference for this effect: deep and bombastic but clean, not excessively sub-heavy, and exactly one deep bump. Earlier synthetic/generated iterations were rejected and deleted. Preserve the one-impact foundation while iterating tonal colour, brightness, duration, or loudness.

## Exploration-to-refinement funnel

Do not begin a new effect with several small parameter changes to one dominant source. The first audition round must explore genuinely different aesthetic hypotheses.

1. Create 6-10 broad candidates using different source families, material identities, orchestration, or signal characters.
2. Hold only non-negotiable constraints constant: gameplay duration range, export profile, fair audition loudness, and requirements such as one low-pressure event.
3. Blind-rate the broad round and keep the strongest 2-3 directions. Reject the rest without polishing them.
4. Build a hybrid round only when the user wants traits from multiple winners.
5. For each surviving direction, make controlled variations in density, tone, timing, tail, and mix.
6. Select one direction for final polish, gameplay-context testing, and Unity-ready export.

Wide exploration candidates are allowed to differ noticeably in waveform, tail, crest factor, and spectral balance. That diversity is the point. Loudness matching must remain exact so louder candidates do not receive an unfair advantage. Before exposing any exploration board, automatically verify required structural constraints across every candidate.

Recorded funnel decision for this effect: keep the pure orchestral direction only; use the meditative direction solely as an optional high-passed, smoothly faded texture in one hybrid. Do not average rejected earth, celestial, fire, arcane, shadow, or dense-holy directions back into later rounds.

## Recommended workflow for every new effect

1. When a stylistic reference exists, run `sfx_deconstruct.py` and inspect its temporal, frequency, and signal-character hypotheses.
2. Translate the `layer_blueprint.json` roles into search targets; do not use the extracted diagnostic audio as source material.
3. Search the unified database using blueprint roles, semantic filename terms, measured traits, and the generated local suggestions.
4. Check `audio_provenance`/rights before selecting sources.
5. Copy an existing JSON recipe or create a new schema-valid recipe under `recipes/`.
6. Give each layer a clear functional role and preserve its rights text.
7. Validate the recipe, render it, and keep the `.render.json` manifest.
8. Run `sfx_compare.py` with `--recipe` and preserve the report beside the render.
9. Build a gain-matched blind audition set linked to the reference deconstruction.
10. Change recipe values rather than hard-coding DSP; rely on cache reuse.
11. Measure low-frequency event count separately when the user asks for one impact, because a musical rise may legitimately count as a broadband transient.

## Planned systems not yet implemented

Do not imply these exist yet:

- LUFS, true peak, transient timestamps, time-varying spectra, tail length, and stronger unpitched classification.
- Local CLAP embeddings/semantic vector search.
- Additional curated non-musical libraries beyond the current gameplay-audio tree.
- Enforced standard output-profile presets for UI, combat, reward, ambience, and cinematic assets.

Implement these incrementally when requested, using the existing index and recipe system rather than creating parallel tooling.
