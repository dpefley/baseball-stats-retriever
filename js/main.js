//Player Name Searched
let name;
//Radio Buttons return in Array
let radios;
//Radio Button Selected
let radioSelected;
//Building the player's information
let player_info = {
  startYear: "0",
  pos: "unknown",
  id: "0",
  yearNum: "0",
  stats: [{}],
  statList: [],
  displayStats: []
}
//Table we will add stats to
let table;
let firstRow;
let tableIndex = 1;

function sendData() {
  document.getElementById("submit-stats").disabled = true;
  document.getElementById("submit-stats").value = "Loading...";
  setTimeout(function() {
    document.getElementById("submit-stats").disabled = false;
    document.getElementById("submit-stats").value = "Get Stats";
  },5000);

  let tempName = name;
  name = document.getElementById('name').value;
  if (tempName === name) {
    alert("You have already requested the stats for this player. Please try another...");
    return;
  }

  radios = document.getElementsByName('answer');
  radioStat();

  let xhttp2 = new XMLHttpRequest();
  fetchPlayer(xhttp2);

  whichStats();
  
  displayTable();
  displayStats();
}

/*
* Determine which radio button has been selected and return it
*/
function radioStat() {
  for (var i = 0; i < radios.length; i++) { 
    if (radios[i].checked) {
      radioSelected = (radios[i].value);
    }
  }
}

/*
* Fetch the player from the API
*/
function fetchPlayer(xhttp2) {
  xhttp2.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let data = JSON.parse(this.responseText);
      let queryResults = data.search_player_all.queryResults;

      if (queryResults.totalSize !== 0) {
        player_info.startYear = queryResults.row.pro_debut_date.substring(0, 4);
        player_info.pos = queryResults.row.position;
        player_info.yearNum = parseInt(player_info.startYear);
        player_info.id = queryResults.row.player_id;
      }
    }
  }
  const fetchPlayerNameURL = "https://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code=%27mlb%27&active_sw=%27Y%27&name_part=%27" + name + "%27";
  xhttp2.open("get", fetchPlayerNameURL, false);
  xhttp2.send();
}

/*
* Grab the stats to display from stat_maps.js and
* store them in the player_info
*/
function whichStats(playerPos) {
  if (player_info.pos === 'P') {
    player_info.displayStats = Object.keys(pitching_stats_map);
    player_info.statList = Object.values(pitching_stats_map);
  } else {
    player_info.displayStats = Object.keys(batting_stats_map);
    player_info.statList = Object.values(batting_stats_map);
  }
}

/*
* Fetch the player's stats from API
*/
function fetchStats(statYear) {
  let xhttp3 = new XMLHttpRequest();

  let fetchStatsURL = 'https://lookup-service-prod.mlb.com/json/named.sport_pitching_tm.bam?league_list_id=%27mlb%27&game_type=%27R%27&season=%27' + statYear + '%27&player_id=%27' + player_info.id + '%27'
  if (player_info.pos !== 'P') {
    fetchStatsURL = 'https://lookup-service-prod.mlb.com/json/named.sport_hitting_tm.bam?league_list_id=%27mlb%27&game_type=%27R%27&season=%27' + statYear + '%27&player_id=%27' + player_info.id + '%27'
  }

  xhttp3.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      player_stats = JSON.parse(this.responseText);

      let stats = [];
      if (player_info.pos === 'P') { //If the player is a pitcher
        let rowOfPitchingStats = player_stats.sport_pitching_tm.queryResults.row;

        if (rowOfPitchingStats.length > 1) { //Multiple teams in the year
          for (let partialSeason = 0; partialSeason < rowOfPitchingStats.length; partialSeason++) {
            stats.push(rowOfPitchingStats[partialSeason]);
          }
        } else { //Only one team in the year
          stats.push(rowOfPitchingStats);
        }
      } else { //If the player is a batter
        let rowOfBattingStats = player_stats.sport_hitting_tm.queryResults.row;

        if (rowOfBattingStats.length > 1) {
          for (let partialSeason = 0; partialSeason < rowOfBattingStats.length; partialSeason++) {
            stats.push(rowOfBattingStats[partialSeason]);
          }
        } else {
          stats.push(rowOfBattingStats);
        }
      }
      player_info.stats = stats; //Set global stats for selected player
    }
  }
  xhttp3.open("get", fetchStatsURL, false);
  xhttp3.send();
}

/*
* Displays the table and the headers for the table of stats
*/
function displayTable() {
  //Following two lines reset the table and the tableIndex for the next player to be searched
  document.getElementById("statsTable").parentNode.removeChild(document.getElementById('statsTable'));
  tableIndex = 1;

  table = document.createElement("TABLE");
  table.id = "statsTable";
  
  let headerRow = table.insertRow(0);
  firstRow = table.insertRow(tableIndex);
  tableIndex++;

  //Display the Display (header) Values
  for (let i = 0; i < player_info.displayStats.length; i++) {
    let statCell = document.createElement('th');
    statCell.innerHTML = player_info.displayStats[i];
    headerRow.appendChild(statCell);
  }

  document.getElementById('table').appendChild(table);
}

/*
* Displays the first row of stats
*/
function displayStats() {
  //Loop over the years from the start year to the current year
  for (let currentYear = player_info.yearNum; currentYear < 2020; currentYear++) {
    fetchStats(currentYear);
    if (player_info.stats.length > 1) { //If there are multiple teams in the same year, display more lines for that year
      for (let partialSeason = 0; partialSeason < player_info.stats.length; partialSeason++) {
        let nextRow = table.insertRow(tableIndex);
        tableIndex++;

        for (let i = 0; i < player_info.statList.length; i++) {
          let firstCell = nextRow.insertCell(i);
          firstCell.innerHTML = player_info.stats[partialSeason][player_info.statList[i]];
        }
      }
    } else { //There was only one team, display normally
      let nextRow = table.insertRow(tableIndex);
      tableIndex++;

      //Display the row of Statistics
      for (let i = 0; i < player_info.statList.length; i++) {
        let firstCell = nextRow.insertCell(i);
        firstCell.innerHTML = player_info.stats[0][player_info.statList[i]];
      }
    }
  }
}

