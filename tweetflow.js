/**
 * @file
 * TweetFlow implementation of jquery-twitter-plugin.
 */

function relative_time(time_value) {
  var parsed_date = Date.parse(time_value);
  var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
  var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);

  if(delta < 60) {
    return 'less than a minute ago';
  }
  else if(delta < 120) {
    return 'about a minute ago';
  }
  else if(delta < (45*60)) {
    return (parseInt(delta / 60)).toString() + ' minutes ago';
  } 
  else if(delta < (90*60)) {
    return 'about an hour ago';
  } 
  else if(delta < (24*60*60)) {
    return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
  }
  else if(delta < (48*60*60)) {
    return '1 day ago';
  }
  else {
    return (parseInt(delta / 86400)).toString() + ' days ago';
  }
}

function tweetflow_run(query_text, rpp) {

  var search_url = "http://search.twitter.com/search.json?rpp=" + rpp + "&q=";
  var query = search_url + query_text + '&callback=?';
  var last_tweet = '';

  var target = $("div.tweetflow-realtime");
  target.text('');

  function make_tweet(item) {
    var content = '';

    // Make url link.
    var link_regexp = /(^| )((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi;
    var user_regexp = /(^| )[\@]+([A-Za-z0-9-_]+)/gi;
    var hash_regexp = /(^| )[\#]+([A-Za-z0-9-_]+)/gi;
    var related_regexp = new RegExp("(^|<a .*?>|[ ,|])(" + Drupal.settings.tweetflow_keyword.join('|') + ")", "gi");

    text = item.text.replace(hash_regexp, '$1<a href="http://search.twitter.com/search?q=&tag=$2&lang=all">#$2</a>');
    text = text.replace(user_regexp,"$1<a href=\"http://twitter.com/$2\">@$2</a>");
    text = text.replace(link_regexp,"$1<a href=\"$2\">$1</a>");
    text = text.replace(related_regexp, "$1<strong>$2</strong>");

    link = '<a href="http://twitter.com/' + item.from_user + '">' + item.from_user + '</a>';
    avatar = '<img src="' + item.profile_image_url + '" width="48px" height="48px" />';
    avatar = '<a href="http://twitter.com/' + item.from_user + '">' + avatar + '</a>';

    content += '<li class="tweetflow-tweet">';
    content += '<div class="tweet-text">' + text + '</div>';
    content += '<div class="tweet-data">';
    content += '<div class="tweet-avatar">' + avatar + '</div>';
    content += '<div class="tweet-data-r"><div class="tweet-from">' + link + '</div>';
    content += '<div class="tweet-when"><a href="http://twitter.com/' + item.from_user + '/status/' + item.id + '">' + relative_time(item.created_at) + '</a></div></div>';
    content += '</div></li>';

    last_tweet = (last_tweet < item.id) ? item.id : last_tweet;
    return content;
  }

  function update_tweet() {
    var search_url = "http://search.twitter.com/search.json?rpp=" + 1 + "&since_id=" + last_tweet + "&q=";
    var query = search_url + query_text + '&callback=?';

    $.getJSON(query, function (data) {
      if (data.results.length > 0) {
        content = make_tweet(data.results[0]);
        content = $(content);
        content.css({display:'none'});
        
        target.find("li:last").hide("slow", function () {
          $(this).remove();
          target.find('ul').prepend(content);
          content.show('slow');
        });

        setTimeout(function () {update_tweet();}, 30000);
      }
    });
  }

  $.getJSON(query, function (data) {
    var content = '<ul class="tweetflow-wrapper">';

    $.each(data.results, function (i, item) {
      content += make_tweet(item);
    });

    content += '</ul>';
    target.append(content);

    setTimeout(function () {update_tweet();}, 10000);
  });
}

$(document).ready(function () {
  tweetflow_run(Drupal.settings.tweetflow_query, Drupal.settings.tweetflow_rpp);
});
