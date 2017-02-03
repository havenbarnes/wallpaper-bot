let twit = require('twit');
let snoowrap = require('snoowrap');
var https = require('https');
let fs = require('fs');
var twitConfig = require('./twit_config.js');
var redditConfig = require('./reddit_config.js');

// Initialize Twitter
var Twitter = new twit(twitConfig);
var Reddit = new snoowrap(redditConfig);

setInterval(postWallpaper, 8600000);

function postWallpaper() {

	// Get wallpaper
	var randomPost = random(0, 20);
	
	Reddit.getSubreddit('wallpapers').getHot()[randomPost].url.then(url => {
		
		var imageURL = './wallpapers/' + url.substring(url.length - 9, url.length - 1)

		if (fs.existsSync(imageURL)) {
			console.log('We\'ve already posted this.. cancelling');
			return;
		}

		var imageFile = fs.createWriteStream(imageURL);
		if (url.indexOf('https') > -1) {
			var request = https.get(url, function(response) {
				response.pipe(imageFile);
				imageFile.on('finish', function() {
					tweet(imageURL);
				});
			});
		} else {
			var request = http.get(url, function(response) {
			response.pipe(imageFile);
			imageFile.on('finish', function() {
				tweet(imageURL);
			});
		});
	}
	});
	
}

function tweet(imageURL) {
	Twitter.postMediaChunked({ file_path: imageURL }, function (err, data, response) {
		if (data != null) {
			console.log(data.media_id_string)
			var mediaIDString = data.media_id_string
			var meta_params = { media_id: mediaIDString, alt_text: { text: 'wallpaper'}}
			
			Twitter.post('media/metadata/create', meta_params, function (err, data, response) {

				var params = { status: '', media_ids: [mediaIDString]}
					
				Twitter.post('statuses/update', params, function(err, data, response) {
					console.log(data)
				});
			});
		}
	});		
}

function random(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
