#!/bin/bash


echo --- Start Translate with 2A Data ---

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for scene in $DIR/app/data/*.SAFE
do
(
cd $scene &&
if [ -e MTD_MSIL2A.xml ]; then
  
        cd IMG_DATA &&

       for resolution in *
		do
		(
			
			cd $resolution &&

			for png in *.png
            do
            echo $png
            if [[ ! -f $png ]]; then
				
				for image in *.jp2
				do

				(
						filename=$image
						filenameWithoutType=${filename%.*}
						gdal_translate -of PNG -co TILED=YES  $image $filenameWithoutType.png
					
				)
				done
				fi
				done
				)
				done

	    fi
) & done

wait
echo --- End Translate with 2A Data ---