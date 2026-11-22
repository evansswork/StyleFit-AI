# Studio wardrobe

The viewer loads `studio-wardrobe.glb` on demand. The following source assets are dedicated to [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). All runtime meshes and maps are bundled locally.

| Source | Parts used |
| --- | --- |
| [Daniel, Innerscene / MakeHuman](https://www.innerscene.com/tools/library/3d-parts/daniel-3d-person-standing-casual-f788af5a) | Hands, field jacket, jeans and leather shoes |
| [Avery, Innerscene / MakeHuman](https://www.innerscene.com/tools/library/3d-parts/relaxed-stance-3d-person-standing-139755ea) | Long-sleeved shirt and collar |
| [Sam, Innerscene / MakeHuman](https://www.innerscene.com/tools/library/3d-parts/hands-behind-back-3d-person-standing-26683679) | Chinos and woven fabric |
| [Standing scale figure, Innerscene / MakeHuman](https://www.innerscene.com/tools/library/3d-parts/abstract-white-man-3d-person-standing-9e06c5d7) | T-shirt, exposed arms and trainers |
| [Taylor, Innerscene / MakeHuman](https://www.innerscene.com/tools/library/3d-parts/turning-to-look-back-3d-person-standing-bcd17ae0) | Trainer textures |
| [Owen, Innerscene / MakeHuman](https://www.innerscene.com/tools/library/3d-parts/seated-sideways-3d-person-resting-e080bd31) | Original V-neck shirt texture and normal map |
| [Human Head, Grab3D](https://grab3d.com/models/anatomy/human-head/) | Synthetic textured portrait. The publisher describes AI-assisted modeling and Blender cleanup. |

Garments were split from the source meshes, fitted to one standing pose and given neutral dye maps that retain seams and wear. Cropped shirt panels sit inside the jacket. Hands and sleeve coverage switch together. The portrait was reduced with UV seams preserved, fitted at the neck, and packaged with its color and normal maps. The final GLB uses meshoptimizer compression. These are shape and color approximations. A product-specific model requires its own licensed geometry.

## Previous portrait prototype

The bundled head and its texture maps derive from *Infinite, 3D Head Scan* by Lee Perry-Smith / Infinite Realities. It is distributed under [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/). The [upstream license notice](LeePerrySmith_License.txt) is included.

Source files came from the [Three.js example asset](https://github.com/mrdoob/three.js/tree/4500a366ccfd5a59aa2ed296c386fa42bb4edb8c/examples/models/gltf/LeePerrySmith). StyleFit packages the geometry, color map, and tangent-space normal map in a self-contained GLB, drops the example camera and light, and crops and scales the bust at render time. The drama still in the reference card is a separate asset.

## Scanned product preview

Adidas Adistar Boost M (SKU F32290, GTIN 887383314715), Google Scanned Objects, © 2020 Google LLC. [Original scan, thumbnails and metadata](https://fuel.gazebosim.org/1.0/GoogleResearch/models/adistar_boost_m) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Source archive version 1.

StyleFit converted the original OBJ into a Y-up GLB and reduced the color texture to 2048 px. Mesh coordinates retain their source scale. The exterior bounding box is approximately 304.7 × 112.6 × 123.3 mm in length, width and height. Source thumbnails were cropped and converted to WebP. On the avatar, a reflected copy stands in for the opposite shoe. The exterior dimensions describe the scanned object.
