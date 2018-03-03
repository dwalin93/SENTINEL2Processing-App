#!/bin/bash

echo --- Start placing IMG_DATA at the root from main folder ---

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for scene in $DIR/test/*.SAFE
do
(

        cd $scene && cd GRANULE && cd * && mv IMG_DATA ../../

)
done

echo --- End placing IMG_DATA at the root from main folder ---
echo "MOVED IMAGES"