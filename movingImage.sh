#!/bin/bash

echo --- Start placing IMG_DATA at the root from main folder ---

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


for scene in $DIR/app/data/*.SAFE
do
(
        cd $scene

        if [[ !  -d IMG_DATA  ]]; then

        cd GRANULE && cd * && mv IMG_DATA ../../
fi
)
done
wait
echo --- End placing IMG_DATA at the root from main folder ---
echo "MOVED IMAGES "
