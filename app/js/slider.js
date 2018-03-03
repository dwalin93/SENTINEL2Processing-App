/**
 * Created by pglah on 09.02.2018.
 */
// Slider Function source: https://github.com/jotform/before-after.js
$(document).ready(function(){
    $('.ba-slider').each(function(){
        var cur = $(this);
        // Adjust the slider
        var width = cur.width()+'px';
        cur.find('.resize img').css('width', width);
    });
});
// Call & init
$(document).ready(function(){
    $('.ba-slider').each(function(){
        var cur = $(this);
        // Adjust the slider
        var width = cur.width()+'px';
        cur.find('.resize img').css('width', width);
        // Bind dragging events
        drags(cur.find('.handle'), cur.find('.resize'), cur);
    });
});

// Update sliders on resize.
// We all do it: i.imgur.com/YkbaV.gif
$(window).resize(function(){
    $('.ba-slider > img:first').on('load', function() {
        var width_first_image = $('.ba-slider > img:first').width() + 'px';
        cur.find('.resize img').css('width', width_first_image);
    });
});

function drags(dragElement, resizeElement, container) {

    // Initialize the dragging event on mousedown.
    dragElement.on('mousedown touchstart', function(e) {

        dragElement.addClass('draggable');
        resizeElement.addClass('resizable');

        // Check if it's a mouse or touch event and pass along the correct value
        var startX = (e.pageX) ? e.pageX : e.originalEvent.touches[0].pageX;

        // Get the initial position
        var dragWidth = dragElement.outerWidth(),
            posX = dragElement.offset().left + dragWidth - startX,
            containerOffset = container.offset().left,
            containerWidth = container.outerWidth();

        // Set limits
        minLeft = containerOffset + 10;
        maxLeft = containerOffset + containerWidth - dragWidth - 10;

        // Calculate the dragging distance on mousemove.
        dragElement.parents().on("mousemove touchmove", function(e) {

            // Check if it's a mouse or touch event and pass along the correct value
            var moveX = (e.pageX) ? e.pageX : e.originalEvent.touches[0].pageX;

            leftValue = moveX + posX - dragWidth;

            // Prevent going off limits
            if ( leftValue < minLeft) {
                leftValue = minLeft;
            } else if (leftValue > maxLeft) {
                leftValue = maxLeft;
            }

            // Translate the handle's left value to masked divs width.
            widthValue = (leftValue + dragWidth/2 - containerOffset)*100/containerWidth+'%';

            // Set the new values for the slider and the handle.
            // Bind mouseup events to stop dragging.
            $('.draggable').css('left', widthValue).on('mouseup touchend touchcancel', function () {
                $(this).removeClass('draggable');
                resizeElement.removeClass('resizable');
            });
            $('.resizable').css('width', widthValue);
        }).on('mouseup touchend touchcancel', function(){
            dragElement.removeClass('draggable');
            resizeElement.removeClass('resizable');
        });
        e.preventDefault();
    }).on('mouseup touchend touchcancel', function(e){
        dragElement.removeClass('draggable');
        resizeElement.removeClass('resizable');
    });
}




function getImage(name) {
    var nameSubstring = name.substring(39,name.length - 5);
    console.log(nameSubstring)
    //var folder = "/data/" + name + '.SAFE' +'/IMG_DATA/' + nameSubstring + '_TCI.png'
    var folder = '/data/S2B_MSIL1C_20180218T041819_N0206_R090_T46QDH_20180218T085403.SAFE/IMG_DATA/T46QDH_20180218T041819_TCI.png';
    console.log(name);
    var url = folder;
    $.ajax({
        url:  url,
        timeout:5000,
        success: function(data,status){
            console.log($('#datepicker1').datepicker('getDate'));
            if($('#datepicker1').datepicker('getDate') !=null) {
                var date = parseDate($('#datepicker1').datepicker('getDate'));
            } else {
                alert('Please select a date for your first image');
            }
            if (date == name.substring(45,name.length-7)){
                var left = document.getElementById('left');
                left.src = folder;
            } else{
                var right = document.getElementById('right');
                right.src = folder;
            }
           // console.log($('#datepicker1').datepicker('getDate').toString().substring(4,16));
          //  if($('#datepicker1').datepicker('getDate'))

        },
        error: function (errorMessage) {
            console.log(errorMessage);
        }
    });
}

function parseDate(date) {
    var stringDate = date.toString();
    var subString = stringDate.substring(4, 16);
    console.log(subString);
    if(/Jan/g.test(subString)) {
        var result = subString.replace(/Jan/g, '01');
    } else if(/Feb/g.test(subString)) {
        var result = subString.replace(/Feb/g, '02');
    } else if(/Mar/g.test(subString)) {
        var result = subString.replace(/Mar/g, '03');
    } else if(/Apr/g.test(subString)) {
        var result = subString.replace(/Apr/g, '04');
    } else if(/May/g.test(subString)) {
        var result = subString.replace(/May/g, '05');
    } else if(/Jun/g.test(subString)) {
        var result = subString.replace(/Jun/g, '06');
    } else if(/Jul/g.test(subString)) {
        var result = subString.replace(/Jul/g, '07');
    } else if(/Aug/g.test(subString)) {
        var result = subString.replace(/Aug/g, '08');
    } else if(/Sep/g.test(subString)) {
        var result = subString.replace(/Sep/g, '09');
    } else if(/Oct/g.test(subString)) {
        var result = subString.replace(/Oct/g, '10');
    } else if(/Nov/g.test(subString)) {
        var result = subString.replace(/Nov/g, '11');
    } else if(/Dec/g.test(subString)) {
        var result = subString.replace(/Dec/g, '12');
    }
    var noSpace = result.replace(/ /g,'');
    console.log(noSpace);
    //02182018
    var output = noSpace.substring(4,noSpace.length) + noSpace.substring(0,4);
    console.log(output);

}



