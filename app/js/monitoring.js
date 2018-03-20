/**
 * Call function every day at 1 o'clock
 */
/**
window.setInterval(function(){
    var date = new Date();
    console.log('checking')
    if(date.getHours() === 1 && date.getMinutes() === 0){
        lookForNewData();

    }
}, 60000);

/**
 * Check if one day has passed
 * @returns {boolean}
 */
function oneDayPassed(){
    var date = new Date().toLocaleDateString();

    if( localStorage.yourapp_date == date )
        return false;

    localStorage.yourapp_date = date;
    return true;
}

/**
 * If one day has passed, look for new images
 * @returns {boolean}
 */
function lookForNewData() {
  /**  if (!oneDayPassed()) {
        return false;
    } else {
    **/
        console.log('I AM RUNNING');
        if (localStorage.getItem('convertedCoordArray') != null) {
            var url = encodeURI('/processing/lookForNewImages');
            $.ajax({
                type: 'GET',
                url: url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: {
                    coordinates: localStorage.getItem('convertedCoordArray')
                },
                success: function (data, response) {
                    console.log('New images arrived.');
                    console.log(data);
                    var parsed = JSON.parse(data.results);
                    console.log(parsed)
                    if (parsed.feed["opensearch:totalResults"] != '0') {
                        var ID = extractID(parsed);
                        var Name = extractName(parsed);
                        console.log(ID);
                        console.log(Name);
                        automatedProcessing(ID, Name);
                    }

                },
                error: function (errorMessage) {
                }
            });
        }
    //}
}

/**
 * Processes the new images automatically
 * @param ID
 * @param Name
 */
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
            insertDataInTable(data);

        },
        error: function (errorMessage) {
        }
    });
}

/**
 * Inserts the new arrived images into a link table
 * @param data
 */
function insertDataInTable(data) {
    var List = $('#images');
    $.each(data.newName, function(i)
    {

            var li = $('<li/>')
                .addClass('ui-menu-item')
                .attr('now', data.newName[i])
                .attr('prev',data.previous[i])
                .attr('temp',data.tempLoc[i])
                .attr('role', 'menuitem')
                .appendTo(List);
            var a = $('<a/>')
                .addClass('ui-all')
                .text(data.newName[i].substring(38, 44) + ' from ' + data.newName[i].substring(11, 19))
                .attr('now', data.newName[i])
                .attr('prev', data.previous[i])
                .attr('ID', data.ID[i])
                .attr('temp',data.tempLoc)
                .appendTo(li);

    });
};

$(function() {
    $('#images').on('click', 'a', function() {
        console.log($(this));
        var prev = $(this)[0].attributes[2].nodeValue;
        var now = $(this)[0].attributes[1].nodeValue;
        showComparedImages(now,prev);
    });
});
/**
 * Show images when clicked on link
 * @param now
 * @param prev
 */
function showComparedImages(now,prev) {
    var currentImage = './temp/' + now + '_' + prev + '_1_CNI.png';
    var previousImage = './temp/' + now + '_' + prev + '_2_CNI.png';
    var right = document.getElementById('right');
    var left = document.getElementById('left');
    right.src = currentImage;
    left.src = previousImage;
    document.getElementById('dateAndTileRight').innerHTML = 'Current Right image: ' + now;
    document.getElementById('dateAndTileLeft').innerHTML = 'Current Left image: ' + prev;
} 