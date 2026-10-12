// =====================================================
// Ain Sokhna - Least-Cost Route Project
// Step 1 (GEE): Sentinel-2 composite + SRTM slope + export
// Paste in code.earthengine.google.com
// =====================================================

// ---------- 1. Study area (~10 x 10 km) ----------
var aoi = ee.Geometry.Rectangle([32.28, 29.52, 32.40, 29.64]);
Map.centerObject(aoi, 11);
Map.addLayer(aoi, {color: 'red'}, 'AOI', true, 0.4);

// ---------- 2. Sentinel-2 (cloud masked, 2025) ----------
function maskS2(img) {
  var scl = img.select('SCL');
  // remove cloud shadow(3), clouds(8,9), cirrus(10), snow(11)
  var clear = scl.neq(3).and(scl.neq(8)).and(scl.neq(9))
                 .and(scl.neq(10)).and(scl.neq(11));
  return img.updateMask(clear)
            .select(['B2', 'B3', 'B4', 'B8', 'B11', 'B12'])
            .divide(10000);
}

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate('2025-01-01', '2025-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(maskS2);

print('Number of images:', s2.size());

var composite = s2.median().clip(aoi);

Map.addLayer(composite, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'True color');
Map.addLayer(composite, {bands: ['B8', 'B4', 'B3'], min: 0, max: 0.4}, 'False color', false);

// ---------- 3. Quick indices (visual check only) ----------
var ndvi  = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndbi  = composite.normalizedDifference(['B11', 'B8']).rename('NDBI');
var mndwi = composite.normalizedDifference(['B3', 'B11']).rename('MNDWI');

Map.addLayer(ndvi,  {min: -0.2, max: 0.6, palette: ['white', 'green']}, 'NDVI', false);
Map.addLayer(ndbi,  {min: -0.5, max: 0.5, palette: ['blue', 'white', 'red']}, 'NDBI', false);
Map.addLayer(mndwi, {min: -0.5, max: 0.8, palette: ['white', 'blue']}, 'MNDWI', false);

// ---------- 4. DEM + Slope (SRTM 30 m) ----------
var dem = ee.Image('USGS/SRTMGL1_003').clip(aoi).rename('elevation');
var slope = ee.Terrain.slope(dem).rename('slope_deg');

Map.addLayer(dem, {min: 0, max: 600, palette: ['green', 'yellow', 'brown', 'white']}, 'DEM', false);
Map.addLayer(slope, {min: 0, max: 35, palette: ['white', 'orange', 'red']}, 'Slope (deg)', false);

// ---------- 5. Export to Google Drive ----------
// UTM zone 36N (EPSG:32636) matches Ain Sokhna
var crs = 'EPSG:32636';

Export.image.toDrive({
  image: composite.toFloat(),
  description: 'Sokhna_S2_composite_2025',
  folder: 'Sokhna_Project',
  fileNamePrefix: 'Sokhna_S2_2025',
  region: aoi,
  scale: 10,
  crs: crs,
  maxPixels: 1e9
});

Export.image.toDrive({
  image: dem.toFloat(),
  description: 'Sokhna_DEM',
  folder: 'Sokhna_Project',
  fileNamePrefix: 'Sokhna_DEM',
  region: aoi,
  scale: 30,
  crs: crs,
  maxPixels: 1e9
});

Export.image.toDrive({
  image: slope.toFloat(),
  description: 'Sokhna_Slope',
  folder: 'Sokhna_Project',
  fileNamePrefix: 'Sokhna_Slope',
  region: aoi,
  scale: 30,
  crs: crs,
  maxPixels: 1e9
});