/* global firebase moment */
// Steps to complete:

// 1. Initialize Firebase
// 2. Create button for adding new train schedules - then update the html + update the database
// 3. Create a way to retrieve train schedules from the train database.
// 4. Create a way to calculate the next arrival time for the trains. Using difference between start and current time.
//    Then use moment.js formatting to set difference in current time and the scheduled arrival time.
// 5. update the schedule board


var trains = [
  {name: "Thomas",
    destination: "sp",
    start:"05:30:00",  //14:41:58-04:00
    frequency: 30},
  {name: "Thomas",
    destination: "sp",
    start:"05:30:00",  //14:41:58-04:00
    frequency: 30}
];

var database = null;

function initTrainDB(){
  var config = {
      apiKey: "AIzaSyD0zw7nCvIQzB9NrkITniVMJF1AO3aYS_E",
      authDomain: "myfirstproj-8336b.firebaseapp.com",
      databaseURL: "https://myfirstproj-8336b.firebaseio.com",
      projectId: "myfirstproj-8336b",
      storageBucket: "myfirstproj-8336b.appspot.com",
      messagingSenderId: "319083739424"
  };
  firebase.initializeApp(config);
  database = firebase.database();
}



$(document).ready(function(){
  // 1. Initialize Firebase
  //initTrainDB();

  //init the local trainlist to hold the trans for refresh the board every 1 munite
  initLocalTransList();

  // 2. Button for adding Employees
  /*$("#add-employee-btn").on("click", function(event) {
    event.preventDefault();
    addTrain();
  });

  //create the dashboard for the schedule
  refreshTrainScheduleBoard();

  var timeCounter = setInterval(refreshTrainScheduleBoard(), 1000);
});