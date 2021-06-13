 var md = new MobileDetect(window.navigator.userAgent);
 var isMobile = md.mobile();


 window.fbAsyncInit = function () {
     //  FB.init({
     //      appId: FB_APP_ID,
     //      cookie: true,
     //      xfbml: true,
     //      version: 'v10.0'
     //  });
     //  FB.AppEvents.logPageView();
 };

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

 function FBInit(FB_app_id) {
     if (FB_app_id) {
         FBReady().then(function () {
             FB.init({
                 appId: FBAppId,
                 cookie: true,
                 xfbml: true,
                 version: 'v10.0'
             });
             FB.AppEvents.logPageView();
             window.FB_app_id = FB_app_id;
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
     FBInit: FBInit,
     FBLogin: FBLogin,
     FBShare: FBShare,
     FBReady: FBReady
 })