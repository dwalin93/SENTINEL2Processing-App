/**
 * Created by pglah on 06.02.2018.
 */
var mapLeft = L.map('mapImage1',
    {
        maxZoom: 24,
            minZoom: -24,
        crs: L.CRS.Simple
    });

var mapRight = L.map('mapImage2',
    {
        maxZoom: 24,
        minZoom: -24,
        crs: L.CRS.Simple
    });

function modalImage(modal,image,modalDiv,text,close) {
// Get the modal


    var modal = document.getElementById(modal);
    var img = document.getElementById(image);
    console.log(modalDiv);
    var captionText = document.getElementById(text);
    img.onclick = function () {
        modal.style.display = "block";
        initLeafletimage(modalDiv,img);
        captionText.innerHTML = this.alt;
    }

// Get the <span> element that closes the modal
    var span = document.getElementsByClassName(close)[0];

// When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }
}

function initLeafletimage(map,image){
    console.log(image.src)
    var imgDimensions={width:600, height:600}
    var imageUrl = image.src;
    var imageBounds = [
        [imgDimensions.width , 0],
        [0, imgDimensions.height]
    ];
    map.setView([imgDimensions.height/2, imgDimensions.width/2], 0);

    L.imageOverlay(imageUrl, imageBounds).addTo(map);

}


modalImage('myModal','left',mapLeft,'caption','close1');
modalImage('myModal2','right',mapRight,'caption2','close2');


