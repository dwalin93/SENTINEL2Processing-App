/**
 * Created by pglah on 05.03.2018.
 */
// OpenCPU Processing
function ProcessImages(){
   var url = encodeURI('/processing/processImages');
    $.ajax({
        type: 'POST',
        url:  url,
        data: {
           shapefile: localStorage.getItem('Shapefile')
        },
        success: function(data,response){
            console.log(data);

        },
        error: function (errorMessage) {
        }
    });
}

function compareNDVIImages(){
    var url = encodeURI('/processing/compareNDVI');
    $ajax({
        type:'GET',
        url: url,
        data: {
            left: document.getElementById('left').src,
            right: document.getElementById('right').src
        },
        dataType: 'image/png',
        success: function (data,response) {
            console.log(data);
        }
    })
}

