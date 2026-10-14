# Methodology

## 1. Study area

A rectangle of about 10 × 10 km near Ain Sokhna (lon 32.28–32.40, lat 29.52–29.64). The area contains the sea, a coastal plain, built-up areas and a rocky mountain block, which gives a clear contrast in terrain cost.

## 2. Data preparation (Google Earth Engine)

- **Imagery:** `COPERNICUS/S2_SR_HARMONIZED`, 2025, scenes with cloud cover below 20%.
- **Cloud masking:** Scene Classification Layer (SCL) used to remove cloud shadow, clouds, cirrus and snow.
- **Composite:** median of the filtered collection, bands B2, B3, B4, B8, B11, B12.
- **Terrain:** `USGS/SRTMGL1_003` DEM, slope in degrees via `ee.Terrain.slope`.
- **Export:** composite at 10 m, DEM and slope at 30 m, all in EPSG:32636.

## 3. Land-cover classification (ENVI 5.6)

- Training ROIs drawn for water, urban, bare desert and rock/mountain; separate validation ROIs kept for accuracy assessment.
- The slope layer was used as a guide when choosing desert versus mountain samples.
- Algorithm: Maximum Likelihood supervised classification.
- Post-classification: majority analysis with a 3 × 3 kernel to remove salt-and-pepper noise.
- Accuracy: confusion matrix using the validation ROIs. Overall Accuracy = [98.9044]%, Kappa = [0.9850].
- Output exported as a single-band GeoTIFF.

## 4. Cost surface (ArcGIS Pro, Spatial Analyst)

Environment: cell size 10 m, snap raster = classified image, UTM 36N.

**Slope cost** (slope resampled to 10 m, then reclassified):

| Slope (°) | Cost |
|---|---|
| 0–5 | 1 |
| 5–10 | 3 |
| 10–15 | 5 |
| 15–25 | 8 |
| > 25 | 10 |

**Land-cover cost:**

| Class | Cost |
|---|---|
| Bare desert | 1 |
| Rock / mountain | 5 |
| Urban | 9 |
| Water | NoData (impassable) |

**Total cost** = 0.6 × slope cost + 0.4 × land-cover cost (Raster Calculator).

The slope-cost raster contained a stray value of -128 (NoData leaking through the classification); it was converted to NoData with `SetNull` before use.

## 5. Least-cost path

1. Two points (`Start` on the coastal side, `End` on the far side of the mountain block) placed on valid cost cells.
2. **Cost Distance** from `Start` over the total cost raster, with a backlink raster.
3. **Optimal Path As Line** (or Cost Path + Raster to Polyline) to `End`.
4. Path segments dissolved into a single line.

## 6. Evaluation

- A straight line between the same two points was created with Merge and Points To Line.
- Both lines were sampled with points every 30 m (Generate Points Along Lines).
- Slope values were extracted to the points (Extract Values to Points) and summarised with Summary Statistics.
- Metrics: length, elongation ratio, mean and median slope, standard deviation, and share of points steeper than 15°.

## 7. Results

| Metric | Optimal path | Straight line |
|---|---|---|
| Length | 13.45 km | 6.72 km |
| Mean slope | 5.19° | 16.13° |
| Median slope | 3.50° | 12.16° |
| Std. deviation | 5.69° | 11.82° |
| Points > 15° | 4.4% (20/450) | 46.5% (105/226) |

## 8. Limitations and possible improvements

- Cost values and weights are judgment-based. A sensitivity analysis (for example, raising the cost for slopes above 25° or changing the 0.6/0.4 weights) would show how stable the route is.
- Slope resolution (30 m) limits how well narrow ridges and valleys are represented.
- Some bare desert was misclassified as urban; refining training samples or adding spectral indices (NDBI, MNDWI) could improve the classification.
- Comparing the route with an existing road, and adding a Civil 3D longitudinal profile, would strengthen the project.
