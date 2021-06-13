var md = new MobileDetect(window.navigator.userAgent);
var isMobile = md.mobile();


function initVideo($el, option) {
    var $d = $.Deferred();
    var defaultOption = {
        autoplay: 0,
        showinfo: 0,
        modestbranding: 1,
        mute: 0
    }
    var opt = Object.assign(defaultOption, option || {})
    var videoId = opt.ytid || $el.attr('ytid');
    var div = document.createElement('div');
    var blur = document.createElement('div');
    blur.className = 'video-blur';
    $el.append(blur);
    $el.append(div);

    var STATE_MAPPING = {
        'ENDED': YT.PlayerState.ENDED,
        'PLAYING': YT.PlayerState.PLAYING,
        'PAUSED': YT.PlayerState.PAUSED,
        'BUFFERING': YT.PlayerState.BUFFERING,
        'CUED': YT.PlayerState.CUED,
    }
    var player = new YT.Player(div, {
        videoId: videoId,
        playerVars: opt,
        events: {
            'onReady': function () {
                $d.resolve(player);
                if (opt.mute) {
                    player.mute();
                }
            },
            'onStateChange': function (event) {
                switch (event.data) {
                    case STATE_MAPPING.CUED:
                        $el.addClass('yt-player-cued')
                        break
                    case STATE_MAPPING.BUFFERING:
                        $el.addClass('yt-player-loading')
                        break
                    case STATE_MAPPING.PAUSED:
                        $el.addClass('yt-player-pause')
                        break
                    case STATE_MAPPING.PLAYING:
                        $el.addClass('yt-player-playing')
                        break
                    case STATE_MAPPING.ENDED:
                        $el.addClass('yt-player-end')
                        if (option.onEnd && typeof option.onEnd === 'function') {
                            option.onEnd(event, player);
                        }
                        break;
                }
            }
        }
    });

    function playerReady() {
        var $d = $.Deferred();
        var timer = setInterval(function () {
            if (player) {
                console.log('ready');
                clearInterval(timer);
                $d.resolve(player);
            }
        }, 100);
        return $d.promise();
    };

    function playVideo() {
        playerReady().then(function (player) {

            if (player) {
                if (player.getPlayerState() === STATE_MAPPING.PLAYING) {
                    return;
                }
                console.log('play', player);
                player.playVideo();
            }
        })
    }

    function stopVideo() {
        playerReady().then(function (player) {
            if (player) {
                if (player.getPlayerState() === STATE_MAPPING.PAUSED) {
                    return;
                }
                player.stopVideo();
            }
        })
    }
    $el.data({
        player: player,
        playVideo: playVideo,
        stopVideo: stopVideo
    })

    return $d.promise();
}

function initVideoSwiper($elment) {

}

function loadScript(path) {
    var tag = document.createElement('script');
    tag.setAttribute('src', path);
    document.head.appendChild(tag);
}

$.extend({
    YT: {
        init: function () {
            var $d = $.Deferred();
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = function () {
                $d.resolve(true);
            }
            return $d.promise();
        }
    },
    FB: {
        getReady() {
            var $d = $.Deferred();
            var timer = setInterval(function () {
                if (window.FB) {
                    clearInterval(timer);
                    $d.resolve(true);
                }
            }, 100);
            return $d.promise();
        },
        init: function (FB_app_id) {
            var $d = $.Deferred();
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            this.FB_ready().then(function () {
                FB.init({
                    appId: FB_app_id,
                    cookie: true,
                    xfbml: true,
                    version: 'v10.0'
                });
                // FB.AppEvents.logPageView();
                $d.resolve(FB);
            })
            return $d.promise();
        },
        getUserInfo: function (authResponse) {
            var $d = $.Deferred();
            FB.api('/me?fields=name,email', function (response) {
                if (!response || response.error) {
                    $d.resolve(false);
                } else {
                    var res = Object.assign(auth, response);
                    window.FBData = res;
                    $d.resolve(res);
                }
            });
            return $d.promise();
        },
        login: function () {
            var _this = this;
            var $d = $.Deferred();
            FB.login(function (response) {
                if (response && response.status === 'connected') {
                    var authResponse = response.authResponse;
                    if (authResponse) {
                        _this.getUserInfo(authResponse).then(function (res) {
                            $d.resolve(res)
                            return;
                        })
                    }
                } else {
                    $d.resolve(false);
                }

            }, {
                scope: 'public_profile, email'
            });
            return $d.promise();
        },
        shareByUrl: function (data) {
            var url = data.url;
            var redirect_uri = data.redirect_uri || window.location.href;
            var hashtag = data.hashtag;
            var href = 'https://www.facebook.com/dialog/share?display=popup&href=' + encodeURIComponent(url) +
                '&redirect_uri=' + encodeURIComponent(redirect_uri) +
                (hashtag ? ('&hashtag=' + encodeURIComponent(hashtag)) : '')

            window.location.href = href;
        },
        shareByApi: function () {
            var $d = $.Deferred();
            var url = data.url;
            var hashtag = data.hashtag;
            FB.ui({
                method: 'share',
                display: 'popup',
                hashtag: hashtag,
                href: url
            }, function (resp) {
                if (resp) {
                    $d.resolve(resp);
                } else {
                    $d.resolve(false);
                }
            });
            return $d.promise();
        },
        share: function (data) {
            if (isMobile) {
                shareByUrl(data);
            } else {
                shareByFbApi(data);
            }
        }
    },
})


$.fn.extend({
    videoPlayer: function (swiperOptions, ytOptions) {
        $elment.each(function (idx, el) {
            var $el = $(el);

            var defaultSwiperOptions = {
                autoHeight: true,
                loop: true,
                nextButton: $elment.parent().find('.next')[0],
                prevButton: $elment.parent().find('.prev')[0],
                onSlideChangeEnd: function (swiper) {
                    playSwiperVideo();
                }
            }

            var swiperOpts = Object.assign(defaultSwiperOptions, swiperOption || {})
            var swiper = new Swiper($el, swiperOpts)

            function playSwiperVideo() {
                var $slides = $elment.find('.swiper-slide');
                var $activeSlide = $slides.filter(".swiper-slide-active");
                $slides.find('.yt-player').html('');
                var $ytPlayer = $activeSlide.find('.yt-player');
                if ($ytPlayer.length) {
                    initVideo($ytPlayer).then(function (player) {
                        if (player && player.playVideo) {
                            player.playVideo();
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
    },
    ytPlayer: function (option) {
        var $elements = this;
        $elements.each(function (idx, el) {
            var $el = $(el);
            var defaultOption = {
                autoplay: 0,
                showinfo: 0,
                modestbranding: 1,
                mute: 0
            }
            var opt = Object.assign(defaultOption, option || {})
            var videoId = opt.ytid || $el.attr('ytid');
            var div = document.createElement('div');
            var blur = document.createElement('div');
            blur.className = 'video-blur';
            $el.append(blur);
            $el.append(div);


            var STATE_MAPPING = {
                'ENDED': YT.PlayerState.ENDED,
                'PLAYING': YT.PlayerState.PLAYING,
                'PAUSED': YT.PlayerState.PAUSED,
                'BUFFERING': YT.PlayerState.BUFFERING,
                'CUED': YT.PlayerState.CUED,
            }

            var player = new YT.Player(div, {
                videoId: videoId,
                playerVars: opt,
                events: {
                    'onReady': function () {
                        if (opt.mute) {
                            player.mute();
                        }
                        if (opt.onReady && typeof opt.onReady === 'function') {
                            opt.onReady(player);
                        }
                    },
                    'onStateChange': function (event) {
                        switch (event.data) {
                            case STATE_MAPPING.CUED:
                                $el.addClass('yt-player-cued')
                                break
                            case STATE_MAPPING.BUFFERING:
                                $el.addClass('yt-player-loading')
                                break
                            case STATE_MAPPING.PAUSED:
                                $el.addClass('yt-player-pause')
                                break
                            case STATE_MAPPING.PLAYING:
                                $el.addClass('yt-player-playing')
                                break
                            case STATE_MAPPING.ENDED:
                                $el.addClass('yt-player-end')
                                if (opt.onEnd && typeof opt.onEnd === 'function') {
                                    opt.onEnd(event, player);
                                }
                                break;
                        }
                    }
                }
            });
            $el.data({
                player: player
            })
        })
    }
});





function FBReady() {
    var $d = $.Deferred();
    var timer = setInterval(function () {
        if (window.FB) {
            clearInterval(timer);
            $d.resolve(true);
        }
    }, 100);
    return $d.promise();
}


function loginByFB() {
    var $d = $.Deferred();
    FB.login(function (response) {
        if (response.status === 'connected') {
            if (response.authResponse) {
                getUserInfo(response.authResponse).then(function (res) {
                    $d.resolve(res)
                })
            } else {
                $d.resolve(false);
            }
        } else {
            $d.resolve(false);
        }
    }, {
        scope: 'public_profile, email'
    });
    return $d.promise();
}

function login() {}




function getLoginStatus() {
    var $d = $.Deferred();
    try {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                $d.resolve(response.authResponse)
            } else {
                $d.resolve(false)
            }

        });
    } catch (e) {
        console.log('getLoginStatus error >>>', e);
        $d.resolve(false)
    }
    return $d.promise();
}

function getUserInfo(auth) {
    var $d = $.Deferred();
    FB.api('/me?fields=name,email', function (response) {
        if (!response || response.error) {
            $d.resolve(false);
        } else {
            var res = Object.assign(auth, response);
            window.FBData = res;
            $d.resolve(res);
        }
    });
    return $d.promise();
}

function checkLoginStatus() {
    var $d = $.Deferred();
    if (window.FBData) {
        $d.resolve(window.FBData)
    } else {
        getLoginStatus().then(function (auth) {
            if (auth) {
                getUserInfo(auth).then(function (res) {
                    $d.resolve(res)
                })
            } else {
                $d.resolve(false)
            }
        })
    }

    return $d.promise();
}



function shareByUrl(data) {
    var url = data.url;
    var redirect_uri = data.redirect_uri || window.location.href;
    var hashtag = data.hashtag;
    var href = 'https://www.facebook.com/dialog/share?display=popup&href=' + encodeURIComponent(url) +
        '&redirect_uri=' + encodeURIComponent(redirect_uri) +
        (hashtag ? ('&hashtag=' + encodeURIComponent(hashtag)) : '')

    window.location.href = href;
}

function shareByFbApi(data) {
    var $d = $.Deferred();
    var url = data.url;
    var hashtag = data.hashtag;
    FB.ui({
        method: 'share',
        display: 'popup',
        hashtag: hashtag,
        href: url
    }, function (resp) {
        if (resp) {
            $d.resolve(resp);
        } else {
            $d.resolve(false);
        }
    });
    return $d.promise();
}

function shareFB(data) {
    if (isMobile) {
        shareByUrl(data);
    } else {
        shareByFbApi(data);
    }
}

function FBInit(FBAppId) {
    if (FBAppId) {
        FBReady().then(function () {
            FB.init({
                appId: FBAppId,
                cookie: true,
                xfbml: true,
                version: 'v10.0'
            });
            FB.AppEvents.logPageView();
            window.FBAppId = FBAppId;
        })
    }
}

function FBLogin() {
    var $d = $.Deferred();
    FBReady().then(function () {
        if (window.FBData) {
            $d.resolve(window.FBData)
        } else {
            getLoginStatus().then(function (auth) {
                if (auth) {
                    getUserInfo(auth).then(function (res) {
                        $d.resolve(res)
                    })
                } else {
                    loginByFB().then(function (res) {
                        $d.resolve(res);
                    });
                }
            })
        }
    })
    return $d.promise();
}

function FBShare(data) {
    if (isMobile) {
        shareByUrl(data);
    } else {
        FBReady().then(function () {
            shareByFbApi(data);
        })
    }
}

$.extend({
    // FBInit: function,
    FBLogin: FBLogin,
    FBShare: FBShare,
    FBReady: FBReady
})