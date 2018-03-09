DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "params:"
echo "ID: $1"
echo "Name: $2"

declare -a IDArray=$1
declare -a NameArray=$2

echo "ID Array looks like: ${IDArray[0]}"

for id in ${!IDArray[@]}; do
   name=("${NameArray[$id]}")
   idIndex=("${IDArray[$id]}")
    echo "I am " "${IDArray[$id]}"
    echo "HERE IS THE" $name
    curl -u dwalin93:Charly09 "https://scihub.copernicus.eu/dhus/odata/v1/Products('"$idIndex"')/\$value" --output $DIR/app/data/$name.zip
    echo "download Product" $name
   done
echo "FINISHED ALL"

