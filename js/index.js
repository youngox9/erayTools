function scrollTo(top) {
    $('html, body')
        .stop()
        .animate({
            scrollTop: top,
        }, 400);
}


function copyText(text) {
    var temp = document.createElement('input');
    temp.type = 'hidden'
    temp.value = text;
    temp.id = 'copyTemp';
    document.body.appendChild(temp);
    var a = new ClipboardJS('#copyTemp', {
        text: function (ele) {
            $('#copyTemp').remove();
            swal("複製成功！", "", "success");
            return text;
        }
    });
    $(temp).trigger('click');
}

$(function () {
    // Fackbook
    // $.FBInit('483706446108606');

    // // 登入 Facebook
    // $('.fb-login').click(function () {
    //     $.FBLogin();
    // })
    // // 分享 Facebook
    // $('.fb-share').click(function () {
    //     $.FBShare({
    //         url: 'www.google.com',
    //         hashtag: '#hashtag'
    //     });
    // })

    // End Fackbook 

    // Hash
    // Hash 改變時滑動至[hash="xxx"]的區塊
    $(window).bind("hashchange", function () {
        var hash = window.location.hash.slice(1);
        var $target = $('[hash=' + hash + ']');
        if ($target.length) {
            var top = $target.offset().top;
            scrollTo(top)
        }
    }).trigger("hashchange");

    // 當點擊含有'#'的連結時，也滾動至該區塊
    $('a[href^="#"]').click(function (e) {
        var $this = $(this);
        var hash = $this.attr("href").slice(1);
        var $target = $('[hash=' + hash + ']');
        if ($target.length) {
            var top = $target.offset().top;
            scrollTo(top)
        }
    });
    // END Hash  


    // GA
    // 分為 category 跟 label
    // category 通常是 父階層 例如: navbar, kv
    // label 通常是 子階層 例如: logo, kv-btn, buy-btn
    // <div track-title="category">
    // <a track="label">
    // or
    // <a track-title="category" track="label">
    $(document).on("click", "[track]", function (e) {
        const $this = $(this);
        const track = $this.attr("track");
        const trackTitle = $this.parents('[track-title]').eq(0).attr("track-title") || $this.attr("track-title");
        trackEvent(trackTitle, track);
    });
    // END GA

    function initVideoSwiper($elment) {
        $elment.each(function (idx, el) {
            var $el = $(el);
            var swiper = new Swiper($el, {
                autoHeight: true,
                loop: true,
                nextButton: $elment.parent().find('.next')[0],
                prevButton: $elment.parent().find('.prev')[0],
                onSlideChangeEnd: function (swiper) {
                    playSwiperVideo();
                }
            })

            function playSwiperVideo() {
                var $slides = $elment.find('.swiper-slide');
                var $activeSlide = $slides.filter(".swiper-slide-active");

                $slides.find('.yt-player').html('');
                var $ytPlayer = $activeSlide.find('.yt-player');
                if ($ytPlayer.length) {
                    initVideo($ytPlayer).then(function (player) {
                        if (player && player.playVideo) {
                            // player.playVideo();
                        }
                    });
                }
            }

            function stopSwiperVideo() {
                var player = $elment.find('.swiper-slide-active .yt-player').data('player');
                if (player && player.stopVideo) {
                    player.stopVideo()
                }
            }
            $el.data({
                swiepr: swiper,
                playSwiperVideo: playSwiperVideo,
                stopSwiperVideo: stopSwiperVideo
            })

        })
    }
})