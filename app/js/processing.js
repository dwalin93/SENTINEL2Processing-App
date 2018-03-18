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
            alert('Images are ready.')
            console.log(data);

        },
        error: function (errorMessage) {
        }
    });
}

function compareNDVIImages(){
    var url = encodeURI('/processing/compareNDVI');
    $.ajax({
        type:'GET',
        url: url,
        data: {
            left: document.getElementById('left').src,
            right: document.getElementById('right').src
        },
        success: function (data,response) {
            console.log('Images arrieved');
            showDifferences();


        }
    })
}

function showDifferences() {
    try {
        var left = parseImageSrc(document.getElementById('left').src);
        var right = parseImageSrc(document.getElementById('right').src);

        var differenceImage = '/temp/' + left.substring(0, 60) + '_' + right.substring(0, 60) + '_CNI.png';

        document.getElementById('left').src = differenceImage;
        document.getElementById('right').src = differenceImage;
    } catch (err){
        alert('images not compared yet');
    }
}

function parseImageSrc(imageSrc){
    var replacehost = imageSrc.toString().replace(/^[^_]*S2/g,"S2");
    var replaceImageType = replacehost.substring(0,replacehost.length-7);
    return replaceImageType;
}