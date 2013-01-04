/**
*   @author Jimmy Man
*/
(function($){
	$.fn.feedTweets = function(settings) {
		var _this = this;
		var settings = $.extend({
			tweetUsers : ['floringrozea','mihaisturzu','KameliaHora','inna_ro','mygiulia','PaulaSeling','tudorionescu','_GuessWho_','ZoliSistem','ancabadiu','catalinjosan','AndreeaMarin','andreeabalan','AndreeaBFan','LeskoOfficial','MogaMarius','MihaiTraistariu','Smiley_omul','andaadam','liviuhodor','EllieWhiteMusic','AndreeaRaicu','banicastefan','alexvelea','AndraOficial','StanAlexandra','mandingaRO','Elena_Gheorghe','PavelBartosh','cabral_ro','andimoisescu','Elena_Basescu','Delia_Official','CorinaOfficial','AntoniaRomania','DeliaAntal','BiancaIonita','crblro','gbuhnici','raduvalcan','adela_popescu'],
			speed : 800,
			count : 17,
			callback : function(){},
			show : 3,
			auto : 5000,
			startTweet: 0,
			popupIndent: true
		}, settings);
		var methods = {
			currentTweet: settings.startTweet,
			formatTwitString : function(str) {
				str=' '+str;
				str = str.replace(/((ftp|https?):\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?)/gm,'<a href="$1" target="_blank">$1</a>');
				str = str.replace(/([^\w])\@([\w\-]+)/gm,'$1@<a href="http://twitter.com/$2" target="_blank">$2</a>');
				str = str.replace(/([^\w])\#([\w\-]+)/gm,'$1<a href="http://twitter.com/search?q=%23$2" target="_blank">#$2</a>');
				return str;
			},
			relativeTime : function(pastTime) {	
				var origStamp = Date.parse(pastTime);
				var curDate = new Date();
				var currentStamp = curDate.getTime();
				
				var difference = parseInt((currentStamp - origStamp)/1000);

				if(difference < 0) return false;

				if(difference <= 5)				return "Just now";
				if(difference <= 20)			return "Seconds ago";
				if(difference <= 60)			return "A minute ago";
				if(difference < 3600)			return parseInt(difference/60)+" minutes ago";
				if(difference <= 1.5*3600) 		return "One hour ago";
				if(difference < 23.5*3600)		return Math.round(difference/3600)+" hours ago";
				if(difference < 1.5*24*3600)	return "One day ago";
				
				var dateArr = pastTime.split(' ');
				return dateArr[4].replace(/\:\d+$/,'')+' '+dateArr[2]+' '+dateArr[1]+(dateArr[3]!=curDate.getFullYear()?' '+dateArr[3]:'');
			},
			popupIndent: function($this){
				var windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
				width = 600, height = 500, winHeight = screen.height, winWidth = screen.width;
				$this.find('.entryMore a').click(function(e){
					left = Math.round((winWidth / 2) - (width / 2));
					top = 0;
					if (winHeight > height) { top = Math.round((winHeight / 2) - (height / 2));	}
					var popup = window.open($(this).attr('href'), 'intent', windowOptions + ',width=' + width + ',height=' + height + ',left=' + left + ',top=' + top);
					if(popup != null && typeof(popup) != 'undefined'){
						e.returnValue = false;
						e.preventDefault && e.preventDefault();
					}
				});
			},
			renderHtml: function($this, arr, limit){
				/* return immediately if arr have not content */
				if(arr.length <= 0) return;
				$this.empty();
				var str = "";
				
				$.each(arr, function(index, value){
					if(index < limit) {
						str = '	<div class="tweet t'+index+'">\
									<a class="avatar" href="http://twitter.com/'+this.from_user+'" target="_blank"><img src="'+this.profile_image_url+'" alt="'+this.from_user+'" height="48" width="48"/></a>\
									<span class="entryContent">\
										<span>'+this.from_user_name+'</span> <a href="http://twitter.com/'+this.from_user+'" target="_blank">('+this.from_user+')</a>\
										<span class="txt">' + methods.formatTwitString(this.text) + '</span>\
										<span class="entryMore">\
											<span class="time">' + methods.relativeTime(this.created_at) + '</span>\
											<span class="reply"><a href="https://twitter.com/intent/tweet?in_reply_to='+this.id_str+'">Reply</a></span>\
											<span class="retweet"><a href="https://twitter.com/intent/retweet?tweet_id='+this.id_str+'">Retweet</a></span>\
											<span class="favorite"><a href="https://twitter.com/intent/favorite?tweet_id='+this.id_str+'">Favorite</a></span>\
										</span>\
									</span>\
								</div>';
									
						$this.append($(str));
					}
				});
				$this.children('div').hide();
				$this.children('div').each(function(index, ele){
					if(index >= methods.currentTweet && index < methods.currentTweet + settings.show){
						$(this).slideDown(settings.speed);
					}
				});
				/* trick when click on indent link */
				if(settings.popupIndent)	{
					methods.popupIndent($this);
				}
				/* run auto if it set */
				if(settings.auto) {
					setTimeout(methods.transitionEnd, settings.auto);
				}
			},
			transitionEnd: function(){
				methods.annimate();
				settings.callback($(_this), methods.currentTweet);
			},
			annimate: function(){
				var $this = $(_this);
				$this.children('.t' + methods.currentTweet).slideUp(settings.speed, function(){
					$(this).appendTo($this).addClass('t' + (methods.currentTweet + settings.count));
					methods.currentTweet++;
				});
				$this.children('.t' + (methods.currentTweet + settings.show)).slideDown(settings.speed);
				setTimeout(methods.transitionEnd, settings.auto);
			}
		};
		return this.each(function(){
			var $this = $(this);
			var total = Math.round(settings.tweetUsers.length/25 + 0.5);
			var buildString, url, c, i, arr = [], countAjax = 0, limit = settings.count;
			console.log(total);
			for(c = 0; c < total; c++) {
				buildString = "";
				i = c * 25;
				for(; i < c * 25 + 25 && i < settings.tweetUsers.length; i++) {	
					if(i == c * 25){
						buildString += "from:" + settings.tweetUsers[i];
					} else {
						buildString += " OR from:" + settings.tweetUsers[i];
					}
				}
				url = "http://search.twitter.com/search.json?q=" + encodeURIComponent(buildString) + "&callback=?&rpp=" + limit;
				$.getJSON(url, function(data){
					arr = $.merge(arr, data.results);
					countAjax++;
					if(countAjax == total){
						arr.sort(function(a, b){
							return Date.parse(a.created_at) < Date.parse(b.created_at) ? 1 : -1;
						});
						
						methods.renderHtml($this, arr, limit);
					}
				});
			}
		});
	}
})(jQuery);