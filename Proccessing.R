library(rgdal)
library(raster)
library(gdalUtils)


Band4 = 'C:/Users/pglah/WebstormProjects/Bachelorarbeit/test/S2B_MSIL1C_20180129T042019_N0206_R090_T46QDJ_20180129T071639.SAFE/IMG_DATA/T46QDJ_20180129T042019_B04.png'
a =raster(Band4)
Band8 = 'C:/Users/pglah/WebstormProjects/Bachelorarbeit/test/S2B_MSIL1C_20180129T042019_N0206_R090_T46QDJ_20180129T071639.SAFE/IMG_DATA/T46QDJ_20180129T042019_B08.png'  
b = raster(Band8)
shape <- readOGR(dsn = "C:/Users/pglah/WebstormProjects/Bachelorarbeit/test/test_Shape.shp", layer = "test_Shape")
####Process pngs####
raster::plot(a)
plot(shape,add=T)
cr <- crop(a, extent(shape), snap="out")  
fr <- rasterize(shape, cr)   
lr <- mask(x=cr, mask=shape)
#rr <- mask(a, shape)
final = plot(lr)
plot(shape,add=T)

raster::plot(b)
plot(shape,add=T)
cr2 <- crop(b,extent(shape), snap="out")  
fr2 <- rasterize(shape, cr2)   
lr2 <- mask(x=cr2, mask=fr2)
final2 = plot(lr2)
plot(shape,add=T)
difference = lr - lr2


tada = NDVI_Result(lr2,lr)
frame = data.frame(lr2.mean=cellStats(lr2,"mean"))


cropRaster = function(raster,shapeLink,shapeLayer){
  layer = shapeLayer
  link = shapeLink
  shape = readShape(link, layer)
  plot(shape)
  band = raster::raster(raster)
  crop = crop(band,raster::extent(shape), snap="out")  
  frame = raster::rasterize(shape,crop)
  layer = raster::mask(x=crop,mask=frame)
  raster::plot(shape)
  return (raster::plot(layer,add=T))
  }

#'Reads in the Shapefile
#'@param link Link to the shapefile
#'@param layer Layer name of the Shapefile to use
readShape = function(link,layer){
  shape = rgdal::readOGR(dsn = link, layer = layer)
  
}

#' Returns the NDVI (NIR-Red/NIR+Red)
#' @param x NIR Band
#' @param y Red Band
NDVI = function(x,y){
  result = (x-y)/(x+y)
  return (result)
}


#' Returns the NDVI image
#' @param x NIR Band
#' @param y Red band
#' @return return NDVI image
NDVI_Result = function(x,y){
  output =  output = raster::overlay(x,y, fun = NDVI)
return (output)
 

}
test = function(shapeLink,shapeLayer){
  hallo = readShape(shapeLink,shapeLayer)
  plot(hallo)
}



