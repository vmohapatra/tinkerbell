/* ================================================
----------- Geass ---------- */

(function ($) {
    "use strict";

    var Geass = {
        initialised: false,
        mobile: false,
        container: $('#portfolio-item-container'),
        blogContainer : $('#blog-container'),
        portfolioItemsAnimated: false,
        init: function () {

            if (!this.initialised) {
                this.initialised = true;
            } else {
                return;
            }

            // Call Geass Functions
            this.queryLoad();
            this.checkMobile();
            this.selectBox();
            this.countTo();
            this.homeSectionHeight();

            var self = this;
            if (typeof imagesLoaded === 'function') {
                /* Gallery pages Animation of gallery elements and isotope filter plugin*/
                imagesLoaded(self.container, function() {
                    self.calculateWidth();
                    self.isotopeActivate();
                    self.scrollTriggerforPortfolioAnim();
                    self.prettyPhoto();
                    // hover animation
                    self.hoverAnimation();
                    // recall for plugin support
                    self.isotopeFilter();
                    // load portfolio projects
                    self.openProject();
                });

                /* Masonry Blog */
                imagesLoaded(self.blogContainer, function() {
                    self.masonryBlog();
                });
            }

        },
        homeSectionHeight:function () {
            // Boxed version fix home section's height
            if ($('#wrapper').hasClass('boxed') || $('#wrapper').hasClass('boxed-long')) {
                var winHeight = $(window).height();
                $('#home').height(winHeight)
            } else {
                return;
            }
        },
        queryLoad: function () {
            var self = this;
            if ($.fn.queryLoader2) {
                $("body").queryLoader2({
                    barColor: "#f8d61b",
                    backgroundColor: "#fff",
                    percentage: true,
                    barHeight: 5,
                    minimumTime: 700,
                    fadeOutTime:200,
                    onComplete: function() {
                        /* fadeout then remove loader*/
                        /* You can change width-height to achieve different animations after load*/
                        $(".geass-loader-overlay").animate({'height':'hide', 'opacity': 0.25}, 460, function() {
                           $(this).remove();
                        });
                    }
                });
            }
        },
        checkMobile: function () {
            /* Mobile Detect*/
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                this.mobile = true;
            } else {
                this.mobile = false;
            }
        },
        countdowns: function () {
            // Countdown plugin Used for event cauntdowns
            if ($.fn.countdown) {

                // countdown  - event.single.html
                var eventCoundown = new Date();
                eventCoundown = new Date(eventCoundown.getFullYear() + 1, 3 - 1, 1);
                $('#event-countdown').countdown({until: eventCoundown});
            }
        },
        checkSupport: function(elemname, pluginname) {
            /* Simple check element and plugin */
            return (elemname.length && pluginname) ? true : false;
        },
        scrollTopBtnAppear: function () {
            // Show/Hide scrolltop button while scrolling
            var windowTop = $(window).scrollTop(),
                    scrollTop = $('#scroll-top');

            if (windowTop >= 200) {
                scrollTop.addClass('fixed');
            } else {
                scrollTop.removeClass('fixed');
            }

        },
        scrollToAnimation: function (speed, offset, e) {
            /* General scroll to function */
            var targetEl = $(this).attr('href'),
                toTop = false;

            if (!$(targetEl).length) {
                if (targetEl === '#home' || targetEl === '#top') {
                    targetPos = 0;
                    toTop = true;
                } else {
                    return;
                }
            } else {
                var elem = $(targetEl),
                    targetPos = offset ? ( elem.offset().top + offset ) : elem.offset().top;
            }

            if (targetEl || toTop) {
                $('html, body').animate({
                    'scrollTop': targetPos
                }, speed || 1200);
                e.preventDefault();
            }
        },
        selectBox: function () {
            // Custom select box via selectbox plugin
            // Be sure to include jquery.selectbox.min.js file
            if ($.fn.selectbox) {
                $('.selectbox').selectbox({
                    effect: "fade"
                });
            }

        },
        bootstrapSwitch: function () {
            //Bootstrap switch
            if ($.fn.bootstrapSwitch) {
                $('.switch').bootstrapSwitch();
            }
        },
        tooltip: function () {
            // Bootstrap tooltip
            if($.fn.tooltip) {
                $('.add-tooltip').tooltip();
            }
        },
        popover: function () {
            // Bootstrap popover
            if($.fn.popover) {
                $('.add-popover').popover({
                    trigger: 'focus'
                });
            }
        },
        countTo: function () {
            // CountTo plugin used count animations for homepages
            if ($.fn.countTo) {
                if ($.fn.waypoint) {
                    $('.count').waypoint(function () {
                        $(this).countTo();
                    }, {
                        offset: function() {
                            return ( $(window).height() - 100);
                        },
                        triggerOnce: true
                    });
                } else {
                    $('.count').countTo();
                }
            } else {
                // fallback if count plugin doesn't included
                // Get the data-to value and add it to element
                $('.count').each(function () {
                    var $this = $(this),
                        countValue = $this.data('to');

                        $this.text(countValue);
                });
            }
        },
        prettyPhoto: function() {
            // Portfolio prettPhoto Plugin - Lightbox for gallery pages etc..
            if ($.fn.prettyPhoto) {

                $("a[data-rel^='prettyPhoto']").prettyPhoto({
                    hook: 'data-rel',
                    animation_speed: 'fast',
                    slideshow: 6000,
                    autoplay_slideshow: true,
                    show_title: false,
                    deeplinking: false,
                    social_tools: '',
                    overlay_gallery: true
                });
            }

        },
        scrollSpyRefresh: function () {
            /* When using scrollspy in conjunction with adding or removing of elements
            from the Dom, we need to use this function to refresh scrollspy like so: */
            $('[data-spy="scroll"]').each(function () {
                var $spy = $(this).scrollspy('refresh')
            });
        },
        parallax: function () {
            // Parallax - if not mobile  with stellar js plugin
            if (!Geass.mobile && $.fn.stellar) {
                $(window).stellar({
                    verticalOffset: 0,
                    horizontalOffset: 0,
                    horizontalScrolling: false
                });
            }
        },
        masonryBlog:function () {
            // Trigger for isotope for blog // example: index14.html
            if($.fn.isotope) {
                this.blogContainer.isotope({
                    itemSelector: '.article',
                    layoutMode: 'masonry'
                });
            }

        },
        // Portfolio/Gallery pages isotope
        calculateWidth: function () {
            // Calculate portfolio items width for better responsive items
            var widthPort = $(window).width(),
                    contWidth = this.container.width(),
                    maxColumn = this.container.data('maxcolumn'),
                    itemW;

            if (widthPort > 1170) {
                itemW = (maxColumn) ? maxColumn: 4;
            } else if (widthPort > 960) {
                itemW = (maxColumn) ? ( (maxColumn > 4 ) ? 4 : 3 ) : 4;
            } else if (widthPort > 767) {
                itemW = 4;
            } else if (widthPort > 540) {
                itemW = 3;
            } else {
                itemW = 1;
            }

            var targetItems = this.container.find('.portfolio-item');
            if (itemW >= 4 && targetItems.hasClass('wide')) {
                this.container.find('.wide').css('width', (Math.floor(contWidth / itemW) * 2 ));
                targetItems.not('.wide').css('width', Math.floor(contWidth / itemW ));
            } else {
                targetItems.css('width', Math.floor(contWidth / itemW));
            }

        },
        isotopeActivate: function() {
            // Trigger for isotop plugin
            if($.fn.isotope) {
                var container = this.container,
                    layoutMode = container.data('layoutmode');

                var iso = container.isotope({
                    itemSelector: '.portfolio-item',
                    layoutMode: (layoutMode) ? layoutMode : 'masonry',
                    transitionDuration: 0
                }).data('isotope');
            }

            // checked layout mode via instance
            // console.log(iso);
        },
        isotopeReinit: function () {
            // Recall for isotope plugin
            if($.fn.isotope) {
                this.container.isotope('destroy');
                this.isotopeActivate();
            }
        },
        isotopeFilter: function () {
            // Isotope plugin filter handle
            // Isotope plugin filter handle
            var self = this,
                filterContainer = $('#portfolio-filter');

            filterContainer.find('a').on('click', function(e) {
                var $this = $(this),
                    selector = $this.attr('data-filter'),
                    animationclass = self.container.data('animationclass'),
                    customAnimation = (animationclass) ? animationclass : 'fadeInUp';

                filterContainer.find('.active').removeClass('active');

                // Delete css Animation and class
                // They effects filtering
                self.container.find('.portfolio-item').removeClass('animate-item '+ customAnimation);

                // And filter now
                self.container.isotope({
                    filter: selector,
                    transitionDuration: '0.8s'
                });

                $this.addClass('active');
                e.preventDefault();
            });
        },
        elementsAnimate: function () {
            // Appear animation on load for gallery/portfolio items
            var animationclass = this.container.data('animationclass'),
                customAnimation = (animationclass) ? animationclass : 'fadeInUp',
                elemLen = this.container.find('.animate-item').length,
                count = 0; // to keep element count


            this.container.find('.animate-item').each(function() {
                var $this = $(this),
                    time = $this.data('animate-time');

                ++count;

                setTimeout(function() {
                    $this.addClass('animated ' +customAnimation);
                }, time);

                if (count === elemLen) {
                    this.portfolioItemsAnimated = true;
                }
            });

            /* relayout isotope after animation */
            if($.fn.isotope && this.portfolioItemsAnimated) {
                this.container.isotope('layout');
            }
        },
        scrollTriggerforPortfolioAnim:function () {
            if($.fn.waypoint) {
                /* Trigger Portfolio item Animations */
                this.container.waypoint(
                    Geass.elementsAnimate.bind(this),
                    {
                        offset: '90%',
                        triggerOnce: true
                    }
                );
            } else {
                Geass.elementsAnimate();
            }
        },
        hoverAnimation: function () {
            // Hover animation for gallery/portfolio pages
            var rotate3d = this.container.data('rotateanimation'),
                rotate3dActive = ( rotate3d ) ? rotate3d : false;

                if ($.fn.hoverdir) {
                    this.container.find('li').each(function ()  {
                        $(this).hoverdir({
                            speed: 400,
                            hoverDelay: 0,
                            hoverElem: '.portfolio-overlay',
                            rotate3d : rotate3dActive
                        });
                    });
                }
        },
        openProject: function () {
            // Open portfolio project with custom animations
            // var self = this,
            //     targetEl = $('#portfolio-single-content'),
            //     targetElIn = targetEl.find('.single-portfolio');


            // $('.open-btn').on('click', function (e) {
            //     e.preventDefault();
            //     var $this = $(this),
            //         parentEl = $this.closest('.portfolio-item');


            //     if(!targetEl.is(':hidden')) {

            //         self.container.find('.portfolio-item.active').removeClass('active');

            //         self.loadProject.call($this, targetEl, parentEl);

            //     } else {

            //         self.loadProject.call(this, targetEl, parentEl);

            //     }
            // });
            var selectedDestNames = [];
            var selectedRegionIds = [];

            $('.portfolio-item').on('click', function (e) {
                var $this = $(this);
                var checkMark = $this.find(".photoSelect");

                var checkedItemCount = $('.photoSelect:visible').length;

                if(checkMark.is(':visible')){
                    checkMark.hide();
                    $this.removeClass('active');
                    if(checkedItemCount-1 == 0) {
                        $('#div_footerContainer_1').css('display','none');
                    }
                    var unselectedDestName = $this.children().closest('span.image-text').text();
                    var unselectedDestId = $this.children().closest('span.image-text').attr('data-regionid');

                    for(var i = selectedDestNames.length - 1; i >= 0; i--) {
                       if(selectedDestNames[i] === unselectedDestName) {
                           selectedDestNames.splice(i, 1);
                       }
                    }

                    for(var j = selectedRegionIds.length - 1; j >= 0; j--) {
                       if(selectedRegionIds[j] === unselectedDestId) {
                           selectedRegionIds.splice(j, 1);
                       }
                    }

                } else {
                    if(checkedItemCount+1 <= 5) {
                        checkMark.show();
                        $this.addClass('active');
                        $('#div_footerContainer_1').css('display','block');
                    }
                }

                $('.photoSelect:visible').each(function(){
                    //console.log($(this).parent().children().closest('span.image-text').text());
                    var destName = $(this).parent().children().closest('span.image-text').text();
                    if(selectedDestNames.indexOf(destName) == -1) { selectedDestNames.push(destName); }

                    var destId = $(this).parent().children().closest('span.image-text').attr('data-regionid');
                    if(selectedRegionIds.indexOf(destId) == -1) { selectedRegionIds.push(destId); }
                });

            });

            $('#div_footerContainer_1').on('click', function (e) {
                //console.log("Next Button Clicked");
                $('#portfolio').css('display','none');
                $('#search-step-2-container').css('display','block');
                $('#div_footerContainer_1').css('display','none');
                $('#div_footerContainer_2').css('display','block');
            });
            $('#div_footerContainer_2').on('click', function (e) {
                //console.log("Search Button Clicked");
                $('#search-step-2-container').css('display','none');
                $('.countto-container').css('display','none');
                $('#div_footerContainer_1').css('display','none');
                $('#div_footerContainer_2').css('display','none');
                //Populate the destination data for the graph
                $('#graph-data').text(selectedDestNames);
                console.log(selectedDestNames);
                console.log(selectedRegionIds);
                console.log("Departure date : "+$('#from-date').val());
                var depDateVal = $('#from-date').val();
                if(depDateVal) {
                    var depDate = new Date(depDateVal);
                    if(!isNaN(depDate.getTime())){
                        console.log(depDate.getMonth() + 1 + '/' + depDate.getDate() + '/' + depDate.getFullYear());
                    }
                }

                var arrDateVal = $('#to-date').val();
                var lengthOfStay = 1;//Default to 1
                if(depDateVal && arrDateVal) {
                    var arrDate = new Date(arrDateVal);
                    console.log("Length of Stay :" +Math.floor((arrDate - depDate)/86400000)+" days");
                    lengthOfStay = Math.floor((arrDate - depDate)/86400000);
                }
                
                //Make call to mongo to retrieve data
                /*$.get('/mymongo', function(res) {
                    //$('#val').text(res);
                    console.log("server mongo response: "+res);
                });*/
                calculateBestDeal(depDateVal, lengthOfStay, selectedRegionIds);
            });
        },
        loadProject: function (targetEl, parentEl) {
            var $this= $(this),
                targetPro = $this.attr('href');
            console.log("image destination selected");
            console.log($this);
            if(targetPro === '') {
                alert('Path is empyt! Please use right path for the project!');
                return;
            }

            if (targetPro.indexOf('.html') == -1) {
                alert('Not a valid path! Please use right path for the project!');
                return;
            }

            var ajaxCall = new $.Deferred();

            $.when(ajaxCall).done(function(data) {

                targetEl.animate({'height': 'show'}, 600, function () {

                    var targetPosition = ( ( targetEl.offset().top ) - 110 );
                    $('html, body').animate({'scrollTop' : targetPosition}, 700);

                    // Refresh scrollspyt
                    $('[data-spy="scroll"]').each(function () {
                        var $spy = $(this).scrollspy('refresh')
                    });
                    parentEl.addClass('active');
                });

                Geass.closeProject();
                Geass.singlePortfolioOwl();
            });

            targetEl.load(targetPro+' #project-content', function (response, status, xhr) {
                ajaxCall.resolve();
            });

        },
        closeProject: function () {
            // Close Projects
            var self = this,
                targetEl = $('#portfolio-single-content'),
                targetElIn = targetEl.find('.single-portfolio');

            $('.portfolio-close').on('click', function (e) {

                $(targetEl).animate({'height': 'hide'}, 400, function () {
                    self.container.find('.portfolio-item.active').removeClass('active');
                    $(this).html('')
                });

                e.preventDefault();
            });

        }
    };

    Geass.init();



    
var calculateBestDeal = function(departDateVal, los, rids) {
    var regionidsToTlas = {}, rid;
    regionidsToTlas['178276'] = ['LAS'];
    regionidsToTlas['178293'] = ['JFK', 'EWR', 'LGA', 'JRB', 'ISP'];
    regionidsToTlas['178294'] = ['MCO', 'SFB'];
    regionidsToTlas['178286'] = ['MIA'];
    regionidsToTlas['178280'] = ['SNA', 'LAX', 'ONT', 'BUR', 'LGB'];
    regionidsToTlas['178304'] = ['SAN', 'CLD'];
    regionidsToTlas['178248'] = ['ORD', 'MDW', 'RFD'];
    regionidsToTlas['178305'] = ['SFO', 'SJC', 'OAK'];
    regionidsToTlas['180077'] = ['HNL'];
    regionidsToTlas['601685'] = ['MYR'];
    regionidsToTlas['178239'] = ['BOS'];
    regionidsToTlas['178318'] = ['BWI', 'IAD', 'DCA'];
    regionidsToTlas['603224'] = ['SNA'];
    regionidsToTlas['178292'] = ['MSY', 'NEW'];
    regionidsToTlas['601750'] = ['MIA', 'FLL'];
    regionidsToTlas['178232'] =['ATL', 'PDK'];
    regionidsToTlas['180073'] = ['OGG'];
    regionidsToTlas['6023765'] = ['MCO', 'SFB', 'MIA'];

    var rid;
    var departDate = new Date(departDateVal);
    var startDate = new Date(departDate.getTime()),
        endDate = new Date(departDate.getTime());

    for (var i = 0; i < rids.length; i++) {
        rid = rids[i];
        console.log(
        '/mymongo?'
        +'regionId='+rid
        +'&regionidsToTlas='+regionidsToTlas[rid]
        +'&departDate='+departDateVal
        +'&los='+los
        );
        var mongourl = '/mymongo?'
        +'regionId='+rid
        +'&regionidsToTlas='+regionidsToTlas[rid]
        +'&departDate='+departDateVal
        +'&los='+los;

        
        $.get(mongourl, function(res) {
           //$('#val').text(res);
           console.log("server mongo response: ");
           console.log(res);
           var graphCategory = [], hotelPriceData=[], flightPriceData=[];
           //populate the graph with data from mongo
           for(var i =0;i<res.totalDeals;i++) {
               console.log(res.pricePackages[i].tla);
               graphCategory.push(res.pricePackages[i].tla);
               hotelPriceData.push(res.pricePackages[i].hotelprice);
               flightPriceData.push(res.pricePackages[i].flightprice);
               
           }
           
           
           console.log(graphCategory);



           
    $(function() {
        $('#graph-container').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Predicted prices for your search'
            },
            xAxis: {
                categories: graphCategory //['Los Angeles', 'Maui', 'Chicago', 'Orlando', 'New York']
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Predicted total cost of trip '
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y} USD<br/>Total: {point.stackTotal} USD'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                        style: {
                            textShadow: '0 0 3px black'
                        }
                    }
                }
            },
            series: [{
                name: 'Hotel',
                data: hotelPriceData //[198, 266, 180, 156, 317 ]
            }, {
                name: 'Flight',
                data: flightPriceData //[244, 553, 326, 304, 375]
            }]
        });
    });
    //Show graphs after config
    $('#graph-container').css('display','block');
       
           
           
        });

    }
}

    /* On load */
    $(window).on('load', function() {
    });

    // Scroll Event
    $(window).on('scroll', function () {
        /* Display Scrol to Top Button */
        Geass.scrollTopBtnAppear();

    });

    // Resize Event
    // Smart resize if plugin not found window resize event
    if($.event.special.debouncedresize) {
        $(window).on('debouncedresize', function() {

            /* Fix Home section height for boxed version */
            Geass.homeSectionHeight();

            /* Portfolio items / isotope retrigger */
            Geass.calculateWidth();
            Geass.isotopeReinit();

            /* Refresh scrollspy */
            Geass.scrollSpyRefresh();

        });
    } else {
        $(window).on('resize', function () {

            /* Fix Home section height for boxed version */
            Geass.homeSectionHeight();

            /* Portfolio items / isotope retrigger */
            Geass.calculateWidth();
            Geass.isotopeReinit();

            /* Refresh scrollspy */
            Geass.scrollSpyRefresh();
        });
    }


})(jQuery);
