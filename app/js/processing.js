// OpenCPU Processing
/**
 * Calls Process Images route
 * @constructor
 */
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

/**
 * Calls the route to compare NDVI images
 */
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

/**
 * Shows either the FCC image or the compared result image clicking the checkbox
 */
function showDifferences() {
    try {
        var left = parseImageSrc(document.getElementById('left').src);
        var right = parseImageSrc(document.getElementById('right').src);
        console.log(left);

        $("input:checkbox").change(function() {
            var ischecked= $(this).is(':checked');
            if(ischecked) {
                var differenceLeft = '/temp/' + left.substring(0, 60) + '_' + right.substring(0, 60) + '_2_CNI.png';
                var differenceRight = '/temp/' + left.substring(0, 60) + '_' + right.substring(0, 60) + '_1_CNI.png';
                console.log(differenceLeft);

                document.getElementById('left').src = differenceLeft;
                document.getElementById('right').src = differenceRight;

            }else {


                var oldLeft = left.substring(0,60);
                var oldRight= left.substring(61,left.length-3);
                var oldsrcLeft = '/data/' + oldLeft + '.SAFE/IMG_DATA/'+ oldLeft.substring(38,44)+ '_' + oldLeft.substring(11,26) + '_FCC.png';
                var oldsrcRight = '/data/' + oldRight + '.SAFE/IMG_DATA/'+ oldRight.substring(38,44) + '_' + oldRight.substring(11,26) + '_FCC.png';
                document.getElementById('left').src = oldsrcLeft;
                document.getElementById('right').src = oldsrcRight;
                }

            })
    } catch (err){
        alert('images not compared yet');
    }
}
/**
 * Helper function to parse the image source saved in HTML div to desired format
 * @param imageSrc
 * @returns {string}
 */
function parseImageSrc(imageSrc){
    var replacehost = imageSrc.toString().replace(/^[^_]*S2/g,"S2");
    var replaceImageType = replacehost.substring(0,replacehost.length-7);
    return replaceImageType;
}