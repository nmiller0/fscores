var teams = require("./controllers/teams");
var express = require("express");
var app = express();
var ejs = require("ejs");
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require('mongoose');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
var Team = require("./models/team").Team;
var database = process.env.DATABASEURL || "mongodb://localhost:27017/fscores";

mongoose.connect( database, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));

var leaguesReq = {
    url : "http://api.football-data.org/v2/competitions/",
    headers: {
        "X-Auth-Token" : "43700807826d4a73a6bc70852eb1613a"
    }
};

app.get('/', function(req,res){
    res.render("home.ejs"); 
});

var excludedLeagues = [2000,2018,2001];

app.get('/leagues', function(req,res){
    request(leaguesReq, function(error,response,body){
        if(!error){
            var leagues = JSON.parse(body);
            var usableLeagues = [];
            for(var i = 0; i < leagues["competitions"].length;i++){
                var TIER = leagues["competitions"][i]["plan"];
                if(TIER === 'TIER_ONE' && !excludedLeagues.includes(leagues["competitions"][i].id)){
                    usableLeagues.push(leagues["competitions"][i]);
                }
            }
            console.log(usableLeagues);
            res.render("leagues.ejs", {leagues:usableLeagues});
        }
    });
 });

 app.get("/league/:id", function(req, res){
    Team.find({leagueID: req.params.id}, function(err, foundTeams){
        if(foundTeams.length != 0){
            

            foundTeams.sort(teams.sortTeams);
            console.log('Rendering...');
            res.render("league.ejs", {results:foundTeams});
        } else {
            console.log('Getting Table!');
            
            teams.getTable(req.params.id);
            Team.find({leagueID: req.params.id}, function(err, foundTeams){
                foundTeams.sort(teams.sortTeams);
                res.render("league.ejs", {results:foundTeams});
            });
        }
    });
 });



var port = process.env.PORT || 3000;

app.listen(port, function(){
    console.log("server started");
});