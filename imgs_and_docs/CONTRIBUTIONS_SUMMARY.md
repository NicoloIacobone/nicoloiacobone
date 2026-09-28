# Contributions summary

Seven GitHub forks, each with an `upstream` remote pointing at the original repository. For each:
the link to the original and two CV-style lines describing my work.

Nothing below states a numerical result, because none of these repositories contains one that is
recorded and reproducible, with the single exception of `vggt`, whose numbers live in `docs/RESULTS.md`
and `docs/FINAL_REPORT.md`.

**Layout convention.** Six of the seven now follow the same shape: `scripts/` for entry points,
`tests/` for standalone checks, `old/` for code not used by the current version (each with a
`README.md` saying what is in it and why), and a root that holds only upstream's files. `vggt`
already had this shape and set the pattern.

---

## vggt

**Original:** [facebookresearch/vggt](https://github.com/facebookresearch/vggt)
**My fork:** [NicoloIacobone/vggt](https://github.com/NicoloIacobone/vggt)

- Built a multi-view-consistent 3D instance segmentation system on a strictly frozen VGGT-1B backbone:
  a MaskDINO-family decoder with cross-frame attention and 3D anchors in PyTorch, scored with the
  official ScanNet 3D instance evaluator vendored unmodified.
- Engineered the full research pipeline around it: per-scene feature caching, four dataset adapters
  (ScanNet v2, ScanNet++, Replica, Aria Synthetic Environments), a 2D-to-3D lifting bridge with
  Sim(3) plus ICP registration, 23 CPU-only test scripts and a SLURM evaluation matrix.

---

## map-anything

**Original:** [facebookresearch/map-anything](https://github.com/facebookresearch/map-anything)
**My fork:** [NicoloIacobone/map-anything](https://github.com/NicoloIacobone/map-anything)

- Added semantic awareness to a metric 3D reconstruction model by distilling SAM 2 encoder features
  into a second parallel DPT head, with a combined distillation plus geometry-aware multi-view
  consistency loss (projection, Z-buffer occlusion check, confidence-weighted consensus, stop-gradient)
  in PyTorch and Hydra.
- Implemented the full training and inference stack: a Hydra-free vendored SAM 2 teacher, stride-4
  feature alignment between teacher and student, per-submodule learning rates with progressive
  DINOv2 unfreezing, bf16 AMP distributed training on SLURM, and Rerun-based PCA and HDBSCAN
  visualisation of the distilled features.

---

## sam3

**Original:** [facebookresearch/sam3](https://github.com/facebookresearch/sam3)
**My fork:** [NicoloIacobone/sam3](https://github.com/NicoloIacobone/sam3)

- Built an automatic 2D instance-annotation pipeline over ScanNet using SAM 3, including a resumable
  SLURM driver covering download, `.sens` extraction, stride-5 frame subsetting and mask generation,
  and a per-instance mask extractor with persistent masklet tracking, IoU-based lost-track
  re-association and per-scene QA output.
- Integrated Florence-2 region proposals as an alternative to hand-written class prompts, and fixed
  three upstream defects needed to run SAM 3.1 (signature-based `init_state` kwarg filtering,
  `pkg_resources` replaced by `importlib.resources`, autocast wrapper removal).

---

## sam2

**Original:** [facebookresearch/sam2](https://github.com/facebookresearch/sam2)
**My fork:** [NicoloIacobone/sam2](https://github.com/NicoloIacobone/sam2)

- Operated SAM 2 as the teacher for a feature-distillation project: exposed the image encoder's
  `backbone_out` as a predictor property, added a feature-substitution hook allowing student features
  to be fed through the teacher's own mask decoder, and ran sharded feature extraction over COCO 2017
  across ten parallel SLURM jobs.
- Built the student-versus-teacher comparison tooling: a five-setting threshold sweep of
  `SAM2AutomaticMaskGenerator` producing paired overlays, plus a helper library for PCA feature
  visualisation, heatmap sanity checks and numerical tensor comparison.

---

## SpaTrackerV2

**Original:** [henry123-boy/SpaTrackerV2](https://github.com/henry123-boy/SpaTrackerV2)
**My fork:** [NicoloIacobone/SpaTrackerV2](https://github.com/NicoloIacobone/SpaTrackerV2)

- Adapted a 3D point tracker for large-scale batch inference on synthetic Kubric scenes: added
  image-folder input alongside video, seeded query points from ground-truth first-frame segmentation
  masks, and raised grid density from 10 to 25.
- Made long-clip inference survive GPU memory limits with an automatic out-of-memory backoff loop that
  increments the temporal stride and flushes CUDA and GC state on retry, and wrote six SLURM drivers
  covering `$HOME`, `/work`, `$SCRATCH` and A100 variants with node-local staging.

---

## kubric

**Original:** [google-research/kubric](https://github.com/google-research/kubric)
**My fork:** [NicoloIacobone/kubric](https://github.com/NicoloIacobone/kubric)

- Extended the MOVi-def worker to generate controlled synthetic video datasets for downstream tracking
  and segmentation: reworked camera sampling (pulled back the shell radius, forced non-degenerate
  linear camera motion) and added a post-render packaging step emitting frames, `metadata.json` and a
  `gt_masks/` folder of per-frame instance segmentation.
- Wrote a Podman-based batch driver covering nine scene configurations across static, dynamic,
  occlusion-heavy and many-object cases at three clip lengths.

---

## MaskDINO

**Original:** [IDEA-Research/MaskDINO](https://github.com/IDEA-Research/MaskDINO)
**My fork:** [NicoloIacobone/MaskDINO](https://github.com/NicoloIacobone/MaskDINO)

- Wrote a one-shot reproducible install script getting MaskDINO to build on an HPC cluster whose
  toolchain is newer than the one it targets, resolving a chain of ABI and API breakages (setuptools
  81, the NumPy 1.x ABI, the `np.bool` and Pillow `Image.LINEAR` alias removals) with each pin
  documented against the specific failure it prevents.
- Solved the CUDA extension build by sourcing a gcc-8.5.0 host compiler from a second module stack,
  since CUDA 11.3's nvcc rejects gcc-12 and bypassing the version check alone fails on glibc 2.35
  headers; also documented switching the demo between all four task variants.

