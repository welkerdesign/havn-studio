# Environment assets — sources and license

All photographic assets in this directory and `ground/` are distributed by [Poly Haven under CC0](https://polyhaven.com/license). They may be used, modified and redistributed, including commercially. They are bundled locally; no runtime image service is required. The original authors are credited below for provenance.

The desert and fall settings use real landscapes photographed in other regions. The interactive vehicle casts shadows onto a ground-projected panorama. Orbiting reveals the full capture around the vehicle.

## Studio lighting

`studio_small_09_1k.hdr` is **Studio Small 09**, by Sergej Majboroda / Poly Haven, distributed under CC0.

Source: https://polyhaven.com/a/studio_small_09

License: https://polyhaven.com/license

Original 1K HDR: https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr

Used as a reflection and lighting map; the visible white studio remains procedural. This adds no runtime service dependency.

## Desert lighting and horizon

[Goegap](https://polyhaven.com/a/goegap), by **Greg Zaal** / Poly Haven:

- `goegap_2k.hdr` — unchanged 2048 × 1024 HDR radiance map, 5,445,362 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/goegap_2k.hdr).
- `goegap_background.jpg` — unchanged 8192 × 4096 official tonemapped photographic panorama, 6,050,862 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/goegap.jpg).

## Autumn lighting and horizon

[Autumn Hill View](https://polyhaven.com/a/autumn_hill_view), by **Grzegorz Wronkowski** / Poly Haven:

- `autumn_hill_view_2k.hdr` — unchanged 2048 × 1024 HDR radiance map, 6,420,814 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/autumn_hill_view_2k.hdr).
- `autumn_hill_view_background.jpg` — 8192 × 4096 photographic panorama, 7,931,264 bytes. [Official source JPEG](https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/autumn_hill_view.jpg), technically recompressed to JPEG quality 88, optimized/progressive, to fit the static hosting budget. Dimensions, composition and photographic content are unchanged. No retouching, color edits or AI-generated imagery were applied.

## Ground materials

All six maps below are unchanged 1024 × 1024 official JPG downloads. Diffuse/albedo maps use sRGB; OpenGL normal and roughness maps contain numeric material data. No height maps are bundled.

[Gravel Ground 01](https://polyhaven.com/a/gravel_ground_01), by **Rob Tuytel** / Poly Haven, photographed tile size **3 m**:

- `ground/gravel_ground_01_diff_1k.jpg` — 954,257 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/gravel_ground_01/gravel_ground_01_diff_1k.jpg).
- `ground/gravel_ground_01_nor_gl_1k.jpg` — 1,314,248 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/gravel_ground_01/gravel_ground_01_nor_gl_1k.jpg).
- `ground/gravel_ground_01_rough_1k.jpg` — 379,669 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/gravel_ground_01/gravel_ground_01_rough_1k.jpg).

[Forest Ground 04](https://polyhaven.com/a/forest_ground_04), by **Rob Tuytel** (photography and processing) and **Rico Cilliers** (minor adjustment) / Poly Haven, photographed tile size **3.2 m**:

- `ground/forest_ground_04_diff_1k.jpg` — 1,113,899 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/forest_ground_04/forest_ground_04_diff_1k.jpg).
- `ground/forest_ground_04_nor_gl_1k.jpg` — 1,326,812 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/forest_ground_04/forest_ground_04_nor_gl_1k.jpg).
- `ground/forest_ground_04_rough_1k.jpg` — 627,507 bytes. [Original download](https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/forest_ground_04/forest_ground_04_rough_1k.jpg).

Complete SHA-256 hashes, lighting measurements and rendering notes are recorded in `research/SCENERY-V20.md` in the source package (also shipped as `docs/research-SCENERY-V20.md` by the release script).

The browser uses locally encoded WebP derivatives of both CC0 photographic panoramas. Desktop uses the original 8192 × 4096 resolution. The mobile version uses a 4096 × 2048 Lanczos downsample. Both versions use quality 86 and retain the source orientation.

## Beach, alpine snow and time of day

The beach uses the photographed shoreline and daylight HDR from [Secluded Beach](https://polyhaven.com/a/secluded_beach). The snow-covered Fall setting uses [Lago di Isola](https://polyhaven.com/a/lago_disola). Its WebP derivatives include a static snow treatment on the banks and branches. All outdoor scene cards and skyline masks derive from their respective CC0 panoramas. The masks let the viewer replace the sky while retaining the photographed treetops and ridgelines.

The sunrise and sunset skies use the 2K radiance maps from [Qwantani Sunrise (Pure Sky)](https://polyhaven.com/a/qwantani_sunrise_puresky) and [Evening Road 01 (Pure Sky)](https://polyhaven.com/a/evening_road_01_puresky). The viewer aligns the direct light with the measured sun in each capture and builds reflections from the resulting scene.
