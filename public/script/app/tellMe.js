(function IIFE() {
    'use strict';

    $(function(){

        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        $("#slider").dateRangeSlider({
            bounds: { min: new Date(2016, 0, 1), max: new Date(2016, 11, 31, 12, 59, 59) },
            defaultValues: { min: new Date(2016, 1, 10), max: new Date(2016, 4, 22) },
            scales: [{
                first: function (value) { return value; },
                end: function (value) { return value; },
                next: function (value) {
                    var next = new Date(value);
                    return new Date(next.setMonth(value.getMonth() + 1));
                },
                label: function (value) {
                    return months[value.getMonth()];
                },
                format: function (tickContainer, tickStart, tickEnd) {
                    tickContainer.addClass("myCustomClass");
                }
            }]
        });

    });
}());
