var twit = require('twit');
var twitConfig = require('./twit_config.js');
var snoowrap = require('snoowrap');
var redditConfig = require('./reddit_config.js');
var https = require('https');
var fs = require('fs');

// Initialize Twitter
var Twitter = new twit(twitConfig);
var Reddit = new snoowrap(redditConfig);

// Set up Bot to attempt ~ 1 tweet/hr
setInterval(postWallpaper, 8600000);

function postWallpaper() {
	var randomPost = random(0, 20);
	
	// Fetch wallpaper
	Reddit.getSubreddit('wallpapers').getHot()[randomPost].url.then(url => {
		var imageURL = './wallpapers/' + url.substring(url.length - 9, url.length - 1)

		if (fs.existsSync(imageURL)) {
			console.log('We\'ve already posted this.. cancelling');
			return;
		}

		// Begin Downloading Image
		var imageFile = fs.createWriteStream(imageURL);
		
		// Handle http/https
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

/**
 * Composes and sends tweet consisting soley of a wallpaper downloaded previously
 *
 * imageURL: Local Image Path to be tweeted out
 */
function tweet(imageURL) {
	// Upload Image File to get media_id
	Twitter.postMediaChunked({ file_path: imageURL }, function (err, data, response) {
		if (data != null) {
			console.log(data.media_id_string)
			var mediaIDString = data.media_id_string
			var meta_params = { media_id: mediaIDString, alt_text: { text: 'wallpaper'}}
			
			// Create Media type to be attached to Tweet
			Twitter.post('media/metadata/create', meta_params, function (err, data, response) {

				var params = { status: '', media_ids: [mediaIDString]}
					
				// Create Tweet, attach Media via params
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
