# Lens Studio

This Lens Studio Project implements the SAXR Lens, where a `datareps.json` can be displayed in AR.

## Folder Structure

All the scripts are in the folder [Assets/](Assets/).

- [Datasets](Assets/Datasets/): sample datasets, each with a `datareps.json` and panel/legend images
- [Materials](Assets/Materials/): materials
- [Meshes](Assets/Meshes/): meshes
- [Modules](Assets/Modules/): modules
- [Prefabs](Assets/Prefabs/): prefabs for the DataRep shapes
- [Scripts](Assets/Scripts/): Lens scripts
  - the scripts for loading a `datareps.json` and instantiating the prefabs in the scene.
  - [Utils](Assets/Scripts/Utils/): utility functions
- [Shaders](Assets/Shaders/): shaders
- [Textures](Assets/Textures/): textures

## Publishing the lens
Follow this [guide](https://developers.snap.com/lens-studio/publishing/submitting/submitting-your-lens)

save as a draft