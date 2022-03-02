/**
 * @Project: EvlonImageLoader.
 * @Licence: The MIT License.
 * @Author: Evlon evlion@qq.com.
 * @Description: Crossbrowser kill Ref load Image.
 * 		It's a hack that prevents the browser of sending the http referrer in the following cases:
 * 			- Image: You can display an image from another site being sure the other site won't know your website is displaying it.
 * 	Other interesting use is displaying an image without blocking the rest of the content, this way in case the image fails
 * it allows the rest of the page to load normally.
 * 		Uses:
 * 			- Load static Image  
 * @Compatibility:
 * 		It's been tested successfully on:
 * 			- Chrome 24.
 * 			- Firefox 15.
 * 			- Safari 6.
 * 			- Opera 12: it sends the referrer in the case of anchors if the target is an iframe, not if it opens in other window
 * 				or the same one, for images it never sends the referrer even without using the hack.
 * 			- IE 6, 7, 8.
 * 			- IE 9: it works for images but not links, that's why in that oogle's url redirection is used for this browser, in this case
 * 					there is an intermediate page.
 * @Interface:
 * 		- ReferrerKiller.linkHtml(url, [innerHtml], [anchorParams], [iframeAttributes]). Returns a string.
 * 		- ReferrerKiller.linkNode(url, [innerHtml], [anchorParams], [iframeAttributes]). Returns an Html Node.
 * 		- ReferrerKiller.imageHtml(url, [imgParams], [iframeAttributes]). Returns a string.
 * 		- ReferrerKiller.imageNode(url, [imgParams], [iframeAttributes]). Returns an Html Node.
 */

/**
 * @module ReferrerKiller
 */
var EvlonImageLoader = (function () {
	var showInfo = false;
	var _imageQueue = [];
	var _iframeReady = false;
	var PUB = {};
	PUB.iframeLoaderId = 'evlonimageloader';

	var  reloadImage = PUB.reloadImage = function(img){
		if(img.src == '')
			return;
		var imgsrc = img.src;	
		if(_iframeReady){	
			//处理，方便缓存		
			var match = imgsrc.match(/(^.+?)\?/);
			if(match){
				imgsrc = match[1];
			}
			
			var iframe = document.getElementById(PUB.iframeLoaderId);
			if(!iframe){
				console.warn('<body><script src="evlonimageloader.js"></script> ...')
				return;
			}
			else{
				var tryTimes = 0;
				var imgsrc_first = imgsrc;
				function doGetImage(){
					if(showInfo) console.info('load image:' + imgsrc);
					iframe.contentWindow.getImage(imgsrc,function(success, imgLoaded){
						if(success){
							img.src = '/static/images/empty.gif';
							img.src = imgsrc;
							img.onerror = null;
							if(showInfo) console.info('OK load image :' + imgsrc)
						}
						else{
							if(tryTimes < 3){
								tryTimes ++;
								imgsrc = imgsrc_first + '?t=' + tryTimes;
								doGetImage();
							}
							else{
								if(showInfo) {
									console.warn('error load image :' + imgsrc);
									alert('error load image :' + imgsrc);
								}
							}
						}
					})
				}
				doGetImage();
				
			}
			
		}
		else{
			_imageQueue.unshift(img);
			if(showInfo) console.info('into image queue:' + imgsrc);
		}
		
	}

	window.__EvlonImageLoader_onIframeReady = PUB.onIframeReady = function(){
		_iframeReady = true;

		if(_imageQueue.length > 0){
			while(_imageQueue.length > 0){
				var img = _imageQueue.pop();
				reloadImage(img);
				
			}
		}
	};

	function buildIframe(id){
		var iframeHtml = '<iframe onload="__EvlonImageLoader_onIframeReady()" \
		style="display:none;width:1px;height: 1px" \
		scrolling="no" \
		frameborder="no" \
		allowtransparency="true" \
		id="' + id + '" ' +
	'	src="javascript:\'\
	<!doctype html>\
	<html>\
	<head>\
	<meta charset=\\\'utf-8\\\'>\
	<meta name=\\\'referrer\\\' content=\\\'never\\\'>\
	<style>*{margin:0;padding:0;border:0;}\x3C/style>\
	\x3C/head>' +
	/*-- Function to adapt iframe's size to content's size --*/
	'<script>\
		function getImage(imgsrc,cb){\
			var image = new Image() ;\
			image.onload = function(){\
				cb(true,image)\
			};\
			image.onerror = function(err) {\
				cb(false,image);\
			};\
			image.src = imgsrc; \
		} \
		console.info(\\\'evlonimageload inner ok.\\\'); \
	\x3C/script><body> \x3C/body>\x3C/html>\'">\x3C/iframe>';

		document.write(iframeHtml);
	}

	


	buildIframe(PUB.iframeLoaderId);
	if(showInfo) console.info('evlonimageload outer ok.');

	return PUB;
})();
