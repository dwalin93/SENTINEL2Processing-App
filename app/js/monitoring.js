
function lookForNewData(){
    if (localStorage.getItem('convertedCoordArray') != null) {
        var url = encodeURI('/processing/lookForNewImages');
        $.ajax({
            type: 'POST',
            url: url,
            data: {
                shapefile: localStorage.getItem('Shapefile'),
                coordinates: localStorage.getItem('convertedCoordArray')
            },
            success: function (data, response) {
                alert('New images arrived.')
                console.log(response);

            },
            error: function (errorMessage) {
            }
        });
    }
}
