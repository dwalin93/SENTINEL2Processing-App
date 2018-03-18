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

regex = new RegExp('(T46QEK|s)');
regex2 = new RegExp('(T46QCJ|s)');

array = ['S2A_MSIL1C_20180310T041559_N0206_R090_T46QEK_20180310T075716.SAFE','S2B_MSIL1C_20180314T041559_N0206_R090_T46QEK_20180314T075716.SAFE','S2B_MSIL1C_20180230T041559_N0206_R090_T46QAK_20180230T075716.SAFE','S2B_MSIL1C_20170230T041559_N0206_R090_T46PEK_20180230T075716.SAFE','S2A_MSIL1C_20161212T041559_N0206_R090_T46QEK_20161212T075716.SAFE'];
array2 = ['S2A_MSIL1C_20180213T041901_N0206_R090_T46QCH_20180213T075744.SAFE','S2B_MSIL1C_20180208T041929_N0206_R090_T46QCJ_20180208T075342.SAFE','S2A_MSIL1C_20180213T041901_N0206_R090_T46QCJ_20180213T075744.SAFE','S2B_MSIL1C_20180310T041559_N0206_R090_T46QDK_20180310T075716.SAFE']
array3 = ['S2A_MSIL1C_20161212T041559_N0206_R090_T46QEK_20161212T075716.SAFE']

var filter = array.filter(e => regex.test(e));
var test = filter.sort(function(a,b){
   a= a.substring(11,19);
   console.log(a);
   b= b.substring(11,19);
    return a.localeCompare(b)
})
console.log(regex);

var filter = array.filter(e => regex.test(e));
var filter2 = array2.filter(e => regex2.test(e));
console.log(filter);
console.log(filter2);
console.log(array);
console.log(array2);
console.log(regex.test(array3));


console.log(test)

