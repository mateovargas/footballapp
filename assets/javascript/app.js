
var competitions = '';
var next_fixtures = [];

$.ajax({
  headers: { 'X-Auth-Token': 'a1343c1c5d024bafb3c6be16564808e2' },
  url: 'http://api.football-data.org/v1/competitions/',
  dataType: 'json',
  type: 'GET',
  }).done(function(response) {

    console.log(response);
    competitions = response;
    console.log(competitions);

    for(var i = 0; i < competitions.length; i++){

      var competition_button = $('<button class="competition-btn">' + competitions[i].caption + '</button>');
      competition_button.attr('id', i);
      $('#buttons-view').append(competition_button);

    }

  });

function displayFixtures(){

  $('#fixture-view').empty();
  var current_competition = $(this).attr('id');

  $.ajax({
    headers: { 'X-Auth-Token': 'a1343c1c5d024bafb3c6be16564808e2' },
    url: competitions[current_competition]._links.fixtures.href,
    dataType: 'json',
    type: 'GET',
  }).done(function(response){

    console.log(response);
    var match_day = 0;

    for(var i = 0; i < response.fixtures.length; i++){

      if(response.fixtures[i].status == 'TIMED'){

        if(match_day == 0){

          match_day = response.fixtures[i].matchday;

        }

        if(response.fixtures[i].matchday == match_day){

          next_fixtures.push(response.fixtures[i]);

        }
      }
    }

    for(var j = 0; j < next_fixtures.length; j++){

      var away_team = next_fixtures[j].awayTeamName;
      var home_team = next_fixtures[j].homeTeamName;
      console.log(away_team + ' at ' + home_team);
      var fixture_div = $('<div>');
      fixture_div.attr('id', 'fixture');
      fixture_div.html('<button class="team-btn" team-name="' + away_team + '"fixture-number=' 
                        + j + ' location="away">' + away_team + '</button>' + ' at ' + '<button class="team-btn" team-name="' 
                        + home_team + '"fixture-number=' + j + ' location="home">' + home_team + '</button>');
      $('#fixture-view').append(fixture_div);

    }

  });
}

function displayTeamInfo(){

  $('#team-view').empty();
  var modal = $('#team-view');

  modal.show();

  var team_name = $(this).attr('team-name');
  var fixture_number = $(this).attr('fixture-number');

  console.log(next_fixtures[fixture_number]);

  if($(this).attr('location') == 'away'){
    var queryURL = next_fixtures[fixture_number]._links.awayTeam.href;
  }
  else{
    var queryURL = next_fixtures[fixture_number]._links.homeTeam.href;
  }

  $.ajax({
    headers: { 'X-Auth-Token': 'a1343c1c5d024bafb3c6be16564808e2' },
    url: queryURL,
    dataType: 'json',
    type: 'GET',
  }).done(function(response){

    console.log(response);
    var team_div = $('<div>');
    var team_name = response.name;
    var short_name = response.shortName;
    var crest_url = response.crestUrl;

    team_div.append('<h2>' + team_name + '</h2>');
    team_div.append('<h3>Shorthand: ' + short_name + '</h3>');
    team_div.append('<img src="' + crest_url + '" alt="team crest"></img');
    modal.append(team_div);
    
  });



}

$(document).on('click', '.competition-btn', displayFixtures);
$(document).on('click', '.team-btn', displayTeamInfo);

$(document).on('click', function(event){
  var modal = $('#team-view');

  if(event.target == modal){

    modal.hide();

  }
});