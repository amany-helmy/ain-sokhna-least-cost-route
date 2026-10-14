# Least-Cost Route Analysis: Ain Sokhna, Egypt

A beginner-friendly geospatial project that finds the least-cost route between two points in a ~10 × 10 km area near Ain Sokhna (Gulf of Suez). The workflow combines **Google Earth Engine**, **ENVI 5.6** and **ArcGIS Pro**.

![Final map](maps/final_layout.png)

## Objective

Find a route that avoids steep terrain and built-up areas, and compare it with the straight line between the same two points.

## Workflow

| Step | Tool | What was done |
|---|---|---|
| 1 | Google Earth Engine | Cloud-masked Sentinel-2 median composite (2025) and SRTM slope for the study area, exported to Drive |
| 2 | ENVI 5.6 | Supervised classification (Maximum Likelihood) into land-cover classes, majority filter, accuracy assessment |
| 3 | ArcGIS Pro | Reclassified slope and land cover into cost surfaces, weighted overlay, Cost Distance, Optimal Path As Line |
| 4 | ArcGIS Pro | Compared the optimal path with the straight line using slope sampled every 30 m |

## Data

- Sentinel-2 Surface Reflectance (Harmonized), 2025, cloud cover < 20%, 10 m
- SRTM 1 arc-second DEM, 30 m
- Coordinate system: WGS 84 / UTM Zone 36N (EPSG:32636)

## Results

| Metric | Optimal path | Straight line |
|---|---|---|
| Length | 13.45 km | 6.72 km |
| Mean slope | 5.19° | 16.13° |
| Median slope | 3.50° | 12.16° |
| Std. deviation of slope | 5.69° | 11.82° |
| Share of sample points with slope > 15° | 4.4% (20 of 450) | 46.5% (105 of 226) |
| Max slope | 49.34° | 45.77° |

Slope was sampled at points every 30 m along each line (the same resolution as the SRTM slope).

**Summary:** the least-cost route is about twice as long as the straight line (elongation ratio ≈ 2.0), but its mean slope is about 68% lower and the share of its length steeper than 15° drops from roughly 47% to roughly 4%.

Max slope is a single pixel and is not a reliable comparison metric, so it is reported for completeness only.

Land-cover classification accuracy (ENVI): Overall Accuracy = **[XX]%**, Kappa = **[X.XX]** (see `docs/confusion_matrix.png`).

## Repository structure

```
├── README.md
├── gee/
│   └── gee_sokhna.js        # GEE script: composite, slope, export
├── maps/
│   └── final_layout.png     # Final map layout
├── results/
└── docs/
    └── methodology.md       # Detailed methodology
```

## How to reproduce

1. Run `gee/gee_sokhna.js` in the [GEE Code Editor](https://code.earthengine.google.com) and export the three outputs from the Tasks tab.
2. Classify the Sentinel-2 composite in ENVI (see `docs/methodology.md`).
3. Build the cost surfaces and route in ArcGIS Pro with the Spatial Analyst extension.

## Limitations

- The slope layer is 30 m, while land cover is 10 m, so the cost surface is limited by the coarser input.
- Land-cover classes are few (4 or fewer), and some bare desert was classified as urban, which overstates built-up area in places.
- Cost values and weights (60% slope, 40% land cover) are expert-judgment choices and were not calibrated against real construction costs.
- One start/end pair was tested, so results are an illustration of the method, not a general conclusion.
- No field survey or existing road data was used for validation.

## Tools

Google Earth Engine · ENVI 5.6 · ArcGIS Pro (Spatial Analyst)
