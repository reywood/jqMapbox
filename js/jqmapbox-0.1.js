/**
 * jqMapbox plugin
 * Inspired by Lightbox2 (http://www.huddletogether.com/projects/lightbox2/)
 *
 * @author Sean Dwyer
 * @version 0.1
 * @date May 30, 2012
 * @copyright (c) 2012 Sean Dwyer
 * @license GNU General Public License v3 <http://www.gnu.org/licenses/>
 */

(function($, window, self, document, undefined) {
	var defaults = {
			overlayColor:		"#000",
			overlayOpacity:		0.8,
			mapWidth:			800,
			mapHeight:			600,
			imageBtnClose:		"images/jqmapbox-btn-close.gif",
			resizeSpeed:		400,
			keyToClose:			"x"
		};
	
	$.fn.mapbox = function(settings) {
		var mapUrl, mapCaption;
		
		settings = $.extend(defaults, settings);
		
		var mapboxClickHandler = function(e) {
			e.preventDefault();
			
			mapUrl = $(this).attr("href");
			mapCaption = $(this).attr("data-jqmapbox-caption");
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
			var html =	'<div id="jqmapbox-overlay"></div>' +
						'<div id="jqmapbox">' +
							'<div id="jqmapbox-iframe-container">' +
								'<div id="jqmapbox-iframe-container-padding"></div>' +
							'</div>' +
							'<div id="jqmapbox-footer">' +
								'<div id="jqmapbox-caption"></div>' +
								'<div id="jqmapbox-buttons">' +
									'<a href="#" id="jqmapbox-close-button"><img src="' + settings.imageBtnClose + '"/></a>' +
								'</div>' +
							'</div>' +
						'</div>';
			
			$("body").append(html);
		};
		
		var setOverlayDimensionsAndDialogPosition = function() {
			var pageSize = getPageSize();
			var pageScroll = getPageScroll();
			
			$("#jqmapbox-overlay").css({
				width: pageSize.pageWidth,
				height: pageSize.pageHeight
			});
			
			$("#jqmapbox").css({
				top: pageScroll.scrollTop + (pageSize.windowHeight / 10),
				left: pageScroll.scrollLeft
			}).show();
		};
		
		var showOverlay = function() {
			$("#jqmapbox-overlay").css({
				backgroundColor: settings.overlayColor,
				opacity: settings.overlayOpacity
			}).fadeIn();
		};
		
		var showDialog = function() {
			$("#jqmapbox").show();
		};
		
		var initDialogCloseHandler = function() {
			$("#jqmapbox-overlay, #jqmapbox, #jqmapbox-iframe-container, #jqmapbox-close-button img").click(function(e) {
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
			animateResizingMapbox(function() {
					showIframe();
					showFooter();
					enableKeyboardNavigation();
				});
		};
		
		var animateResizingMapbox = function(onComplete) {
			$("#jqmapbox-footer").hide();

			$("#jqmapbox-iframe-container").animate(
				getDialogWidthHeight(),
				settings.resizeSpeed,
				onComplete);

			$("#jqmapbox-footer").css("width", settings.mapWidth);
		};
		
		var getDialogWidthHeight = function() {
			var newWidth = settings.mapWidth + getHorizontalPadding();
			var newHeight = settings.mapHeight + getVerticalPadding();
			
			return {
					width: newWidth,
					height: newHeight
				};
		};
		
		var getHorizontalPadding = function() {
			var $container = $("#jqmapbox-iframe-container-padding");
			return parseInt($container.css("padding-left"), 10) + parseInt($container.css("padding-right"), 10);
		};
		
		var getVerticalPadding = function() {
			var $container = $("#jqmapbox-iframe-container-padding");
			return parseInt($container.css("padding-top"), 10) + parseInt($container.css("padding-bottom"), 10);
		};

		var showIframe = function() {
			$("#jqmapbox-iframe-container-padding").html('<iframe id="jqmapbox-iframe" src="' + mapUrl + '" ' +
										'width="' + settings.mapWidth + '" height="' + settings.mapHeight + '" ' +
										'scrolling="no" frameBorder="0" border="0" style="border: 0;"></iframe>');
		};
		
		var showFooter = function() {
			$("#jqmapbox-caption").hide();
			$("#jqmapbox-footer").slideDown("fast");
			$("#jqmapbox-caption").text(mapCaption).show();
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
			
			if (keyChar === settings.keyToClose || isEscapeKeyCode(event, keyCode)) {
				closeDialogAndCleanUp();
			}
		};
		
		var isEscapeKeyCode = function(event, keyCode) {
			return keyCode === getEscapeKeyValue(event);
		};
		
		var getEscapeKeyValue = function(event) {
			if (typeof KeyEvent !== "undefined" && KeyEvent.DOM_VK_ESCAPE) {
				return KeyEvent.DOM_VK_ESCAPE;
			}
			else if (event && event.DOM_VK_ESCAPE) {
				return event.DOM_VK_ESCAPE;
			}
			else if (window.event) {
				return 27;
			}
			return null;
		};
		
		var closeDialogAndCleanUp = function() {
			$("#jqmapbox").remove();
			$("#jqmapbox-overlay").fadeOut(function() {
				$("#jqmapbox-overlay").remove();
			});
			disableKeyboardNavigation();
			showStubbornElements();
		}
		
		var hideStubbornElements = function() {
			var $elements = $("embed, object, select, iframe");
			$elements.each(function() {
				var $this = $(this);
				$this.attr("data-jqmapbox-visibility", $this.css("visibility"));
			});
			$elements.css("visibility", "hidden");
		}
		
		var showStubbornElements = function() {
			var $elements = $("embed, object, select, iframe");
			$elements.each(function() {
				var $this = $(this);
				$this.css("visibility", $this.attr("data-jqmapbox-visibility"));
				$this.removeAttr("data-jqmapbox-visibility");
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
})(jQuery, window, self, document);
