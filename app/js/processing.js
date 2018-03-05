/**
 * Created by pglah on 05.03.2018.
 */
// OpenCPU Processing
function testOCPU(){
   var url = encodeURI('/processing/test')
    console.log('testing route');
    $.ajax({
        type: 'GET',
        url:  url,
        success: function(data,response){
            console.log(data);

        },
        error: function (errorMessage) {
        }
    });
}

