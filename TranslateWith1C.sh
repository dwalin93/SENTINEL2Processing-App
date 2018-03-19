#!/bin/bash


echo --- Start Translate with 1C Data ---
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for scene in $DIR/app/data/*.SAFE
do
(
cd $scene &&
if [ -e MTD_MSIL1C.xml ]; then
	echo scene 1C
	cd IMG_DATA

for png in *.png
do
echo $png
if [[ ! -f $png ]]; then
	for image in *.jp2
	do
	echo "${image%.*}"
	(
	echo here after
		filename=$image
		filenameWithoutType=${filename%.*}
		gdal_translate -of PNG -co TILED=YES  $image $filenameWithoutType.png

	)
	done
fi
done
fi


) & done

echo --- End Translate with 1C Data ---