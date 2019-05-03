function sendData(){
    var name = document.getElementById('name').value
    var radios = document.getElementsByName('answer');
    for (var i = 0, length = radios.length; i < length; i++){
         if (radios[i].checked){
          var radio = (radios[i].value);
         }
       }
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() {

    // Wait for readyState = 4 & 200 response
    if (this.readyState == 4 && this.status == 200) {

        // parse JSON response
        ///console.log('sucess')
        data = JSON.parse(this.responseText);
        if(data.search_player_all.queryResults.totalSize != '0'){
          var startYear = data.search_player_all.queryResults.row.pro_debut_date.substring(0,4)
          var pos = data.search_player_all.queryResults.row.position
          //console.log(data.search_player_all.queryResults.row)
          var yearNum = parseInt(startYear)
          //console.log(startYear)
          //console.log(pos)
          var id = data.search_player_all.queryResults.row.player_id
        //  console.log(data.search_player_all.queryResults.row)
          if(pos != 'P'){
            url1 = 'https://lookup-service-prod.mlb.com/json/named.sport_hitting_tm.bam?league_list_id=%27mlb%27&game_type=%27R%27&season=%27'+startYear+'%27&player_id=%27'+id+'%27'
          }else{
            url1 = 'https://lookup-service-prod.mlb.com/json/named.sport_pitching_tm.bam?league_list_id=%27mlb%27&game_type=%27R%27&season=%27'+startYear+'%27&player_id=%27'+id+'%27'
          }
          //console.log(url1)
          var xhttp3 = new XMLHttpRequest();
          xhttp3.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              document.getElementById("statsTable").parentNode.removeChild(document.getElementById('statsTable'))
              var index = 1
              var player = (JSON.parse(this.responseText))
              if(pos != 'P'){
                var statList = ['year','ab', 'h', 'd', 't', 'hr', 'bb', 'avg', 'obp', 'slg', 'ops', 'rbi', 'so', 'babip']
                var stats = player.sport_hitting_tm.queryResults.row
              }else{
                var statList = ['year','ip', 'g', 'gs', 'era', 'avg', 'obp', 'slg', 'obp', 'ops', 'whip', 'hr9','so','bb']
                var stats = player.sport_pitching_tm.queryResults.row
              }
              var table = document.createElement('TABLE')
              table.id = 'statsTable'
              var row = table.insertRow(0)
              var row1 = table.insertRow(index)
              index = index + 1
              var ops = [stats['ops']]
              var babip = [stats['babip']]
              var other = [stats[radio]]
              for(var i=0; i < statList.length; ++i){
                var cell = document.createElement('th');
                cell.innerHTML = statList[i]
                row.appendChild(cell)
              }
              var cell1 = row1.insertCell(0)
              cell1.innerHTML = yearNum
              for(var i=1; i < statList.length; ++i){
                var cell1 = row1.insertCell(i)
                cell1.innerHTML = stats[statList[i]]
              }
              for(j = yearNum+1; j < 2020; ++j){
                url2 = 'https://lookup-service-prod.mlb.com/json/named.sport_hitting_tm.bam?league_list_id=%27mlb%27&game_type=%27R%27&season=%27'+j+'%27&player_id=%27'+id+'%27'
                var xhttp4 = new XMLHttpRequest();
                xhttp4.onreadystatechange = function() {
                  if (this.readyState == 4 && this.status == 200) {
                    var statList = ['year','ab', 'h', 'd', 't', 'hr', 'bb', 'avg', 'obp', 'slg', 'ops', 'rbi', 'so', 'babip']
                    var player = (JSON.parse(this.responseText))
                    var stats = player.sport_hitting_tm.queryResults.row
                    var row1 = table.insertRow(index)
                    var cell1 = row1.insertCell(0)
                    cell1.innerHTML = yearNum + index -1
                    index = index + 1
                    for(var i=1; i < statList.length; ++i){
                      var cell1 = row1.insertCell(i)
                      cell1.innerHTML = stats[statList[i]]
                      if(statList[i] == 'ops'){
                        ops.push(stats[statList[i]])
                      }
                      if(statList[i] == 'babip'){
                        babip.push(stats[statList[i]])
                      }
                      if(statList[i] == radio){
                        other.push(stats[statList[i]])
                      }

                    }

                    document.getElementById('myDiv').style.top = (400 + babip.length*25) + 'px';
                    document.getElementById("leaders").style.top = (900 + 25*babip.length) + "px";

                    if(yearNum + index - 2 == 2019){

                      var big = []
                      for(i = 0; i < babip.length; ++i){
                        big.push(yearNum + i)
                      }
                      var babip2 = {
                          x: big,
                          y: babip,
                          type: 'scatter',
                          name: 'babip'
                        };

                        var ops2 = {
                            x : big,
                            y: ops,
                            type: 'scatter',
                            name: 'ops'
                          };

                         var other3 = {
                             x : big,
                             y: other,
                             type: 'scatter',
                             name: radio
                            };

                      var data = [babip2, ops2, other3];
                      var layout = {
                      title: {
                        text:'babip vs ops vs '+radio,
                        font: {
                          family: 'Trebuchet MS, sans-serif',
                          size: 24
                        },
                        xref: 'paper',
                        x: 0.05,
                      },
                      xaxis: {
                        title: {
                          text: 'Year',
                          font: {
                            family: 'Trebuchet MS, sans-serif',
                            size: 18,
                            color: '#7f7f7f'
                          }
                        },
                      },
                      yaxis: {
                        title: {
                          text: 'Performance',
                          font: {
                            family: 'Trebuchet MS, sans-serif',
                            size: 18,
                            color: '#7f7f7f'
                          }
                        }
                      }
                    };
                      Plotly.newPlot('myDiv', data, layout, {responsive: true});

                      console.log("gets to leaderboard");
                      var leaderboardURL;
                      if (pos != 'P') {
                        leaderboardURL = "https://lookup-service-prod.mlb.com/json/named.leader_hitting_repeater.bam?sport_code=%27mlb%27&results=10&game_type=%27R%27&season=%272019%27&sort_column=%27"+ radio +"%27&leader_hitting_repeater";
                      }
                      else {
                        leaderboardURL = "https://lookup-service-prod.mlb.com/json/named.leader_pitching_repeater.bam?sport_code=%27mlb%27&results=10&game_type=%27R%27&season=%272019%27&sort_column=%27"+ radio +"%27&leader_pitching_repeater";
                      }

                      var xhttp5 = new XMLHttpRequest();
                      xhttp5.onreadystatechange = function() {
                        // Wait for readyState = 4 & 200 response
                        if (this.readyState == 4 && this.status == 200) {
                          document.getElementById("leadersTable").parentNode.removeChild(document.getElementById("leadersTable"));
                          console.log(JSON.parse(this.responseText));
                          //document.getElementById('leadersTable').style.top = (852 + babip.length*25) + 'px';

                          var leaders = JSON.parse(this.responseText);
                          var table1 = document.createElement('TABLE');
                          table1.id = 'leadersTable';
                          document.getElementById("leaders").appendChild(table1);
                          // document.getElementById("plotCont").appendChild(table1);

                          var row = table1.insertRow(0);
                          var radioVal = document.createElement('th');//.innerHTML = radio;
                          var nameText = document.createElement('th');//.innerHTML = "NAME";

                          radioVal.innerHTML = "Selected Stat: " + radio;
                          nameText.innerHTML = "NAME";

                          row.appendChild(radioVal);
                          row.appendChild(nameText);

                          console.log(leaders);

                          var leaderNames = leaders.leader_hitting_repeater.leader_hitting_mux.queryResults.row;
                          var leaderVals = leaders.leader_hitting_repeater.leader_hitting_mux.queryResults.row;

                          console.log(leaderNames);
                          console.log(leaderVals);

                          for (var i = 0; i < leaderNames.length; ++i) {
                            var newRow = table1.insertRow(i+1);
                            var newVal = document.createElement('td');
                            var newName = document.createElement('td');

                            newVal.innerHTML = leaderVals[i][radio];
                            newName.innerHTML = leaderNames[i]["name_display_first_last"];

                            newRow.appendChild(newVal);
                            newRow.appendChild(newName);
                          }



                        }
                        else if (this.readyState == 4) {
                          console.log(this.responseText);
                        }
                      }
                      xhttp5.open("get", leaderboardURL, true);
                      xhttp5.send();

                  }
                  else if (this.readyState == 4) {
                      //console.log(this.responseText);

                  }

                }
              }

                xhttp4.open("get", url2, true);
                xhttp4.send();

              }


              document.getElementById('table').appendChild(table)

            } else if (this.readyState == 4) {

                // this.status !== 200, error from server
                //console.log(this.responseText);

            }

          }
          xhttp3.open("get", url1, true);
          xhttp3.send();
        }else{
          alert('Invalid Player or Year. Try Again')
        }

    } else if (this.readyState == 4) {

        // this.status !== 200, error from server
        //console.log(this.responseText);

    }
    // var heightTable = document.getElementById("statsTable").clientHeight;
    // alert(heightTable);
    // document.getElementById("table").style.height = heightTable;
  };
  var url = "https://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code=%27mlb%27&active_sw=%27Y%27&name_part=%27"+name+"%27"
  xhttp2.open("get", url, true);
  xhttp2.send();
}
