const mongoose= require('mongoose');

const tripSchema= new mongoose.Schema({
   travelName: String,
   source: Object,
   destination: Object,
   startDate: String,
   endDate: String,
   totalBudget: String,
   difficulty: Object,
   groupType: Object,
   stayPreference: Object,
   foodPreference: Object,
   specialNotes: String,
   AIOverview: String,
   userId: String,
   createdAt: Date
});

module.exports= mongoose.model("Trip", tripSchema);