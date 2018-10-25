var mongoose = require('mongoose');

var LeagueSchema = new mongoose.Schema({
    name: String,
    leagueID: Number,
    teams: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    }
});
  
var League = mongoose.model('League', LeagueSchema);

module.exports = {
    League: League
}
