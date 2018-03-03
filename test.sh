#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

curl -u dwalin93:Charly09 "https://scihub.copernicus.eu/dhus/odata/v1/Products('d5390699-85af-4526-9360-b7b4216419b7')/\$value" --output $DIR/test/1.zip &&
curl -u dwalin93:Charly09 "https://scihub.copernicus.eu/dhus/odata/v1/Products('d5390699-85af-4526-9360-b7b4216419b7')/\$value" --output $DIR/test/2.zip &&
curl -u dwalin93:Charly09 "https://scihub.copernicus.eu/dhus/odata/v1/Products('d5390699-85af-4526-9360-b7b4216419b7')/\$value" --output $DIR/test/3.zip 