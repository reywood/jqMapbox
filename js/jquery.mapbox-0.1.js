/**
 * jQuery mapbox plugin
 * Inspired by Lightbox2 (http://www.huddletogether.com/projects/lightbox2/)
 *
 * @author Sean Dwyer
 * @version 0.1
 * @date May 30, 2012
 * @copyright (c) 2012 Sean Dwyer
 * @license GNU General Public License v3 <http://www.gnu.org/licenses/>
 */

(function($, window, document, undefined) {
	var defaults = {
			overlayColor:			"#000",		// (string) Color of overlay
			overlayOpacity:			0.8,		// (decimal) Opacity of overlay: 0.0 - 1.0
			iframeWidth:			800,
			iframeHeight:			600,
			imageBtnClose:			"/images/mapbox-btn-close.gif",		// (string) Path and the name of the close btn
			containerBorderSize:	10,			// (integer) Value of padding for #mapbox-iframe-container-padding in CSS file
			containerResizeSpeed:	400,		// (integer) Duration of animation when opening in miliseconds
			keyToClose:				"c"			// (string) Keyboard shortcut to close the mapbox dialog. ESC and "x" will also close dialog.
		};
	
	$.fn.mapbox = function(settings) {
		var mapUrl, mapCaption;
		
		settings = $.extend(defaults, settings);
		
		var mapboxClickHandler = function(e) {
			e.preventDefault();
			
			mapUrl = $(this).attr("href");
			mapCaption = $(this).attr("data-caption");
			showMapbox();
			
			return false;
		}
		
		var showMapbox = function() {
			hideStubbornElements();
			initDialogInterface();
			loadMap();
		}
		
		var initDialogInterface = function() {
			initDom();
			setOverlayDimensionsAndDialogPosition();
			
			showOverlay();
			showDialog();
			
			initDialogCloseHandler();
			initWindowResizeHandler();
		};
		
		var initDom = function() {
			var html =	'<div id="jquery-mapbox-overlay"></div>' +
						'<div id="jquery-mapbox">' +
							'<div id="mapbox-iframe-container">' +
								'<div id="mapbox-iframe-container-padding">' +
									'<iframe id="mapbox-iframe" src="/blank.html" width="' + settings.iframeWidth + '" height="' + settings.iframeHeight + '" scrolling="no" frameBorder="0" border="0" style="border: 0;"></iframe>' +
								'</div>' +
							'</div>' +
							'<div id="mapbox-footer">' +
								'<div id="mapbox-caption"></div>' +
								'<div id="mapbox-buttons">' +
									'<a href="#" id="mapbox-close-button"><img src="' + settings.imageBtnClose + '"></a>' +
								'</div>' +
							'</div>' +
						'</div>';
			
			$("body").append(html);
		};
		
		var setOverlayDimensionsAndDialogPosition = function() {
			var pageSize = getPageSize();
			var pageScroll = getPageScroll();
			
			$("#jquery-mapbox-overlay").css({
				width: pageSize.pageWidth,
				height: pageSize.pageHeight
			});
			
			$("#jquery-mapbox").css({
				top: pageScroll.scrollTop + (pageSize.windowHeight / 10),
				left: pageScroll.scrollLeft
			}).show();
		};
		
		var showOverlay = function() {
			$("#jquery-mapbox-overlay").css({
				backgroundColor:	settings.overlayColor,
				opacity:			settings.overlayOpacity
			}).fadeIn();
		};
		
		var showDialog = function() {
			$("#jquery-mapbox").show();
		};
		
		var initDialogCloseHandler = function() {
			$("#jquery-mapbox-overlay, #jquery-mapbox, #mapbox-iframe-container, #mapbox-close-button img").click(function(e) {
				if (e.target === this) {
					e.preventDefault();
					closeDialogAndCleanUp();
					return false;
				}
			});
		};
		
		var initWindowResizeHandler = function() {
			$(window).resize(function() {
				setOverlayDimensionsAndDialogPosition();
			});
		};
		
		var loadMap = function() {
			$("#mapbox-footer").hide();
			
			animateResizingMapbox();
		};
		
		var animateResizingMapbox = function() {
			var newWidth = (settings.iframeWidth + (settings.containerBorderSize * 2));
			var newHeight = (settings.iframeHeight + (settings.containerBorderSize * 2));
			
			$("#mapbox-iframe-container").animate({
					width: newWidth,
					height: newHeight
				},
				settings.containerResizeSpeed,
				function() {
					showIframe();
					showFooter();
				});

			$("#mapbox-footer").css({
				width: settings.iframeWidth
			});
		};

		var showIframe = function() {
			$('#mapbox-iframe').attr("src", mapUrl);
			enableKeyboardNavigation();
		};
		
		var showFooter = function() {
			$("#mapbox-caption").hide();
			$("#mapbox-footer").slideDown("fast");
			$("#mapbox-caption").text(mapCaption).show();
		}
		
		var enableKeyboardNavigation = function() {
			$(document).keydown(keyboardEventHandler);
		};
		
		var disableKeyboardNavigation = function() {
			$(document).unbind("keydown", keyboardEventHandler);
		};
		
		var keyboardEventHandler = function(event) {
			var keyCode = (event) ? event.keyCode : window.event.keyCode;
			var keyChar = String.fromCharCode(keyCode).toLowerCase();
			
			if (keyChar === settings.keyToClose || keyChar === "x" || isEscapeKeyCode(event, keyCode)) {
				closeDialogAndCleanUp();
			}
		};
		
		var isEscapeKeyCode = function(event, keyCode) {
			if (event && event.DOM_VK_ESCAPE) {
				return keyCode === event.DOM_VK_ESCAPE;
			}
			else if (window.event) {
				return keyCode === 27;
			}
			return false;
		};
		
		var closeDialogAndCleanUp = function() {
			$("#jquery-mapbox").remove();
			$("#jquery-mapbox-overlay").fadeOut(function() {
				$("#jquery-mapbox-overlay").remove();
			});
			disableKeyboardNavigation();
			showStubbornElements();
		}
		
		var hideStubbornElements = function() {
			var $elements = $("embed, object, select, iframe");
			$elements.each(function() {
				var $this = $(this);
				$this.attr("data-mapbox-visibility", $this.css("visibility"));
			});
			$elements.css("visibility", "hidden");
		}
		
		var showStubbornElements = function() {
			var $elements = $("embed, object, select, iframe");
			$elements.each(function() {
				var $this = $(this);
				$this.css("visibility", $this.attr("data-mapbox-visibility"));
				$this.removeAttr("data-mapbox-visibility");
			});			
		}
		
		var getPageSize = function() {
			var scrollWidth, scrollHeight, pageHeight, pageWidth, windowWidth, windowHeight;
			
			if (window.innerHeight && window.scrollMaxY) {	
				scrollWidth = window.innerWidth + window.scrollMaxX;
				scrollHeight = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
				scrollWidth = document.body.scrollWidth;
				scrollHeight = document.body.scrollHeight;
			} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
				scrollWidth = document.body.offsetWidth;
				scrollHeight = document.body.offsetHeight;
			}
			
			if (self.innerHeight) {	// all except Explorer
				if(document.documentElement.clientWidth){
					windowWidth = document.documentElement.clientWidth; 
				} else {
					windowWidth = self.innerWidth;
				}
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) { // other Explorers
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}	
			// for small pages with total height less then height of the viewport
			if (scrollHeight < windowHeight){
				pageHeight = windowHeight;
			} else { 
				pageHeight = scrollHeight;
			}
			// for small pages with total width less then width of the viewport
			if (scrollWidth < windowWidth){	
				pageWidth = scrollWidth;		
			} else {
				pageWidth = windowWidth;
			}
			
			return {
				pageWidth: pageWidth,
				pageHeight: pageHeight,
				windowWidth: windowWidth,
				windowHeight: windowHeight
			};
		};
		
		var getPageScroll = function() {
			var scrollLeft = 0, scrollTop = 0;
			
			if (self.pageYOffset || self.pageXOffset) {
				scrollTop = self.pageYOffset;
				scrollLeft = self.pageXOffset;
			} else if (document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft)) {
				scrollTop = document.documentElement.scrollTop;
				scrollLeft = document.documentElement.scrollLeft;
			} else if (document.body && (document.body.scrollTop || document.body.scrollLeft)) {
				scrollTop = document.body.scrollTop;
				scrollLeft = document.body.scrollLeft;	
			}

			return {
				scrollLeft: scrollLeft,
				scrollTop: scrollTop
			};
		};
		
		
		return this.unbind("click").click(mapboxClickHandler);
	};
})(jQuery, window, document);
