/**
 * Created by pglah on 06.02.2018.
 */
function initUI() {
    var resize= $("#resizeable");
    var containerWidth = $("body").width();

    $(resize).resizable({
        handles: 'e',
        /*maxWidth: 450,
         minWidth: 120,*/
        classes: { "ui-resizable-handle": "hidden-xs hidden-sm" },
        resize: function(event, ui){
            var currentWidth = ui.size.width;

            // this accounts for padding in the panels +
            // borders, you could calculate this using jQuery
            var padding = 10;

            // this accounts for some lag in the ui.size value, if you take this away
            // you'll get some instable behaviour
            $(this).width(containerWidth - currentWidth - padding);

            // set the content panel width
            $("#resizeable").width(currentWidth);
        }
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    initUI();
});

regex = new RegExp('S2B_MSIL1C_20180310T041559_N0206_R090_T46QEK_20180310T075716.SAFE','g');

array = ['S2B_MSIL1C_20180310T041559_N0206_R090_T46QEK_20180310T075716.SAFE'];

console.log(array.some(e => regex.test(e)));

