
function lookForNewData(){
    if (localStorage.getItem('convertedCoordArray') != null) {
        var url = encodeURI('/processing/lookForNewImages');
        $.ajax({
            type: 'GET',
            url: url,
            contentType: 'application/json; charset=utf-8',
            dataType:'json',
            data: {
                coordinates: localStorage.getItem('convertedCoordArray')
            },
            success: function (data, response) {
                alert('New images arrived.');
                console.log(data);
                var parsed = JSON.parse(data.results);
                console.log(parsed)
                if(parsed.feed["opensearch:totalResults"]!='0') {
                    var ID = extractID(parsed);
                    var Name = extractName(parsed);
                    console.log(ID);
                    automatedProcessing(ID,Name);
                }

            },
            error: function (errorMessage) {
            }
        });
    }
}

function automatedProcessing(ID,Name) {
    console.log(ID);
    var url = encodeURI('/processing/automatedProcessing');
    $.ajax({
        type: 'POST',
        url:  url,
        data: {
            shapefile: localStorage.getItem('Shapefile'),
            id: ID,
            name: Name
        },
        success: function(data,response){
            alert('Images are ready.');
            console.log(data);

        },
        error: function (errorMessage) {
        }
    });
}