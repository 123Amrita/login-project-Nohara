const mongoose= require('mongoose');

const tripSchema= new mongoose.Schema({
   travelName: String,
   source: String,
   destination: String,
   startDate: String,
   endDate: String,
   totalBudget: String,
   difficulty: String,
   groupType: String,
   stayPreference: String,
   foodPreference: String,
   specialNotes: String,
   AIOverview: String
});

module.exports= mongoose.model("Trip", tripSchema);