//Hook up the tweet display

/*
$(".countdown").countdown({
    date: "12 March 2024 18:30:00",
    format: "on"
},

function() {
    // callback function
});
*/
$(document).ready(function() {
    console.log("Document is ready");
    
    if ($("#section_2").length) {
        console.log("#section_2 is present");
    } else {
        console.log("#section_2 is not found");
    }
});
