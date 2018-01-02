
var competitions = '';
var next_fixtures = [];
var modal = $('#team-view');
var modal_flag = false;
var current_team = '';
modal.hide();


$.ajax({
  headers: { 'X-Auth-Token': 'a1343c1c5d024bafb3c6be16564808e2' },
  url: 'http://api.football-data.org/v1/competitions/',
  dataType: 'json',
  type: 'GET',
  }).done(function(response) {

    competitions = response;

    for(var i = 0; i < competitions.length; i++){

      var competition_button = $('<button class="competition-btn">' + competitions[i].caption + '</button>');
      competition_button.attr('id', i);
      $('#buttons-view').append(competition_button);

    }

  });

function displayFixtures(){

  $('#fixture-view').empty();
  $('#team-view').empty();
  next_fixtures.length = 0;

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

      if(response.fixtures[i].status == 'TIMED' || response.fixtures[i].status == 'SCHEDULED'){

        if(match_day == 0){

          match_day = response.fixtures[i].matchday;

        }

        if(response.fixtures[i].matchday == match_day){

          next_fixtures.push(response.fixtures[i]);

        }
      }
    }

    $('#fixture-view').append('<h4>All times seen are Pacific Standard Time</h4>');

    for(var j = 0; j < next_fixtures.length; j++){

      var away_team = next_fixtures[j].awayTeamName;
      var home_team = next_fixtures[j].homeTeamName;
      var date = moment(next_fixtures[j].date).format('dddd, MMMM Do YYYY, h:mm:ss a');

      var fixture_div = $('<div>');
      fixture_div.attr('id', 'fixture');
      fixture_div.html('<button class="team-btn" team-name="' + away_team + '"fixture-number=' 
                        + j + ' location="away">' + away_team + '</button>' + ' at ' + '<button class="team-btn" team-name="' 
                        + home_team + '"fixture-number=' + j + ' location="home">' + home_team + '</button>');
      fixture_div.append('<p>Kick Off: ' + date + '</p>');
      $('#fixture-view').append(fixture_div);

    }

  });
}

function displayTeamInfo(){

  $('#team-view').empty();
  modal.show();

  var team_name = $(this).attr('team-name');
  current_team = team_name;
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
    team_div.addClass('modal-content');
    team_div.append('<span class="close">&times;</span>');
    var team_name = response.name;
    var short_name = response.shortName;
    var crest_url = response.crestUrl;

    team_div.append('<h2>' + team_name + '</h2>');
    team_div.append('<h3>Shorthand: ' + short_name + '</h3>');
    team_div.append('<img src="' + crest_url + '" alt="team crest"></img');

    var fixture_btn = $('<button>');
    fixture_btn.text('Click to see Current Form')
    fixture_btn.attr('fixtures', response._links.fixtures.href);
    fixture_btn.attr('id', 'fixture-btn');
    team_div.append(fixture_btn);

    var player_btn = $('<button>');
    player_btn.text('Click to see Current Squad');
    player_btn.attr('id', 'player-btn');
    player_btn.attr('players', response._links.players.href);
    team_div.append(player_btn);

    modal.append(team_div);
    modal.append('<br>');

    modal_flag = true;

  });



}

function displayForm(){

    var queryURL = $(this).attr('fixtures');
    var total_goals = 0;
    var home_goals = 0;
    var away_goals = 0;
    var goals_against = 0;
    var wins = 0;
    var draws = 0;
    var losses = 0;

    console.log(queryURL);
    $.ajax({
      headers: { 'X-Auth-Token': 'a1343c1c5d024bafb3c6be16564808e2' },
      url: queryURL,
      dataType: 'json',
      type: 'GET',
    }).done(function(response){

      $('#team-view').empty();
      modal.show();
      console.log(response);

      var table_div = $('<div>');
      table_div.addClass('modal-content');
      table_div.append('<span class="close">&times;</span>');

      var fixture_table = $('<table>');
      fixture_table.attr('id', 'player-table');
      fixture_table.append('<tr><th>Match Day</th><th>Date</th><th>Home</th><th>Away</th><th>Home Goals</th><th>Away Goals</th><th>Result</th></tr>');

      for(var i = 0; i < response.fixtures.length; i++){

        if(response.fixtures[i].status == 'TIMED' || response.fixtures[i].status == 'SCHEDULED'){
          break;
        }

        var matchday = response.fixtures[i].matchday;
        var date = moment(response.fixtures[i].date).format("MMMM Do YYYY, h:mm a");
        var home_team = response.fixtures[i].homeTeamName;
        var away_team = response.fixtures[i].awayTeamName;
        var result = response.fixtures[i].result;
        var half_result = response.fixtures[i].result.halfTime;

        var fixture_row = $('<tr>');
        fixture_row.append('<th>' + matchday + '</th>');
        fixture_row.append('<th>' + date + '</th>')
        fixture_row.append('<th>' + home_team + '</th>');
        fixture_row.append('<th>' + away_team + '</th>');
        fixture_row.append('<th>' + result.goalsHomeTeam + '</th>');
        fixture_row.append('<th>' + result.goalsAwayTeam + '</th>');
        

        if(current_team == home_team && (result.goalsHomeTeam > result.goalsAwayTeam) || 
           current_team == away_team && (result.goalsAwayTeam > result.goalsHomeTeam)){

          fixture_row.append('<th id="result-col">W</th>');
          fixture_row.css('background-color', 'green');
          wins++;

        }
        else if(current_team == home_team && (result.goalsHomeTeam == result.goalsAwayTeam) || 
                current_team == away_team && (result.goalsAwayTeam == result.goalsHomeTeam)){

          fixture_row.append('<th id="result-col">D</th>');
          draws++;

        }
        else{

          fixture_row.append('<th id="result-col">L</th>');
          fixture_row.css('background-color', 'red');
          losses++;
        
        }

        fixture_table.append(fixture_row);


      }
  
      table_div.append(fixture_table);
      //ADD DIV TO DISPLAY NUMERICAL RECORD, GOALS FOR AND AGAINST,

      var stats_div = $('<div>');



      modal.append(table_div);
      modal_flag = true;
    });
}

function displaySquad(){

  var queryURL = $(this).attr('players');

  $.ajax({
    headers: { 'X-Auth-Token': 'a1343c1c5d024bafb3c6be16564808e2' },
    url: queryURL,
    dataType: 'json',
    type: 'GET',
  }).done(function(response){

    $('#team-view').empty();
    modal.show();
    console.log(response);

    var table_div = $('<div>');
    table_div.addClass('modal-content');
    table_div.append('<span class="close">&times;</span>');

    var player_table = $('<table>');
    player_table.attr('id', 'player-table');
    player_table.append('<tr><th>Name</th><th>Number</th><th>Position</th><th>Nationality</th></tr>');

    for(var i = 0; i < response.players.length; i++){

      var player_row = $('<tr>');
      player_row.append('<th>' + response.players[i].name + '</th>');
      player_row.append('<th>' + response.players[i].jerseyNumber + '</th>');
      player_row.append('<th>' + response.players[i].position + '</th>');
      player_row.append('<th>' + response.players[i].nationality + '</th>');
      player_table.append(player_row);
    }

    table_div.append(player_table);
    modal.append(table_div);
    modal_flag = true;

  });
}

$(document).on('click', '.competition-btn', displayFixtures);
$(document).on('click', '.team-btn', displayTeamInfo);
$(document).on('click', '#fixture-btn', displayForm);
$(document).on('click', '#player-btn', displaySquad);

$(document).on('click', '.close', function(){

  var modal = $('#team-view');

  modal.hide('slow');
  modal_flag = false;

});
