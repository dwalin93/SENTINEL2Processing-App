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

	for image in *.jp2
	do
	if [ ! -f "${image%.png}" ]; then
	(
		filename=$image
		filenameWithoutType=${filename%.*}
		gdal_translate -of PNG -co TILED=YES $image $filenameWithoutType.png
	)
	fi
	done
fi
) & done

echo --- End Translate with 1C Data ---