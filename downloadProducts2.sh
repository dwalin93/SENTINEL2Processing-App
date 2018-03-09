#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "params:"
echo "ID: $1"
echo "Name: $2"

curl -u dwalin93:Charly09 "https://scihub.copernicus.eu/dhus/odata/v1/Products('""$1""')/\$value" --output $DIR/app/data/"$2".zip
echo 'load'

wait -n
echo "download Product" "$2"