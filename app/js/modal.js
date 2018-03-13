/**
 * Created by pglah on 06.02.2018.
 */

function modalImage(modal,image,modalDiv,text,close) {
// Get the modal

    var modal = document.getElementById(modal);
    var img = document.getElementById(image);
    var modalDiv = document.getElementById(modalDiv);
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
    var imgDimensions={width:300, height:300} //this is the height and width of the image. It hasn't been loaded yet.

    var map = L.map(map, {
        maxZoom: 24,
        minZoom: -24,
        crs: L.CRS.Simple
    }).setView([imgDimensions.height/2, imgDimensions.width/2], 0);

    var imageUrl = image.src;
    var imageBounds = [
        [imgDimensions.width , 0],
        [0, imgDimensions.height]
    ];

    L.imageOverlay(imageUrl, imageBounds).addTo(map);
}

modalImage('myModal','left','mapImage1','caption','close1');
modalImage('myModal2','right','mapImage2','caption2','close2');

