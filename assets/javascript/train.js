/* global firebase moment */
// Steps to complete:

// 1. Initialize Firebase
// 2. Create button for adding new train schedules - then update the html + update the database
// 3. Create a way to retrieve train schedules from the train database upon record been added or deleted from DB
// 4. adding remove buttons for each train. Let the user delete the train
// 5. Create a way to calculate the next arrival time and minutes to arrival for the trains every minute. Using difference between start and current time.
//    Then use moment.js formatting to set difference in current time and the scheduled arrival time.

var database = null;

//Initialize Firebase
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

//function to caculate calculate the next arrival time and minutes to arrival
function setTrainInfo(currentTime, todayDate, trainInfo){
   //get today's first arrival time
    var todayFirstTrainTimeStr = "";
    if(trainInfo.todayFirstTrainTimeStr.length == 0){
      todayFirstTrainTimeStr = todayDate + "T" + trainInfo.start;
      trainInfo.todayFirstTrainTimeStr = todayFirstTrainTimeStr;
    } else {
      todayFirstTrainTimeStr = trainInfo.todayFirstTrainTimeStr;
    }
    var todayFirstTrainTime = moment(todayFirstTrainTimeStr, "YYYY-MM-DDTHH:mm:ss Z");

    //get the minutes past from previous arrival time
    var minsbetween = currentTime.diff(todayFirstTrainTime, "minutes");
    var nextArrivalTimeStr = trainInfo.nextArrivalTimeStr;
    var minsToWait = trainInfo.minsToWait;

    if(minsbetween > 0){
      //get the time for wait in minutes
      var minsPast = minsbetween % trainInfo.frequency;
      minsToWait = trainInfo.frequency - minsPast;

      //get the next arrival time by adding the number of trans frequency x frequency
      //var nextArrivalTime = currentTime.add(minsToWait, "minutes"); //this will keep the ss in the arr
      var indexOfNextTrain = Math.ceil(minsbetween / trainInfo.frequency) ; 
      var nextArrivalTime = todayFirstTrainTime.add(trainInfo.frequency * indexOfNextTrain, "minutes");
      nextArrivalTimeStr = nextArrivalTime.format("YYYY-MM-DDTHH:mm:ss")
    } else{
      minsToWait = Math.abs(minsbetween);
      nextArrivalTimeStr = todayFirstTrainTimeStr;
    }
    trainInfo.nextArrivalTimeStr = nextArrivalTimeStr;
    trainInfo.minsToWait = minsToWait;
}

//refresh all the table cells with the up-to-minute information of next arrival time and minutes to arrival
function resetTrainScheduleNextArr(){
  //get the current time
  var currentTime = moment([]);
  $('#current-time').text(currentTime.format());

  //get today's first arrival time
  var todayDate = currentTime.format("YYYY-MM-DD");

  $.each($('#train-schedule-table > tbody > tr'), function(index, row){
    var trainInfo = {
      start: moment($('td:eq(2)', this).text(), "HH:mm:ss"), 
      frequency: $('td:eq(3)', this).text(),
      todayFirstTrainTimeStr: $('td:eq(2)', this).text(),
      nextArrivalTimeStr: "",
      minsToWait: 0
    };
    setTrainInfo(currentTime, todayDate, trainInfo);
    $('td:eq(4)', this).text(trainInfo.nextArrivalTimeStr);
    $('td:eq(5)', this).text(trainInfo.minsToWait);
  });
}

//add handler for the Add button been clicked to add the train into DB and the schedule dashboard
function addAddBtnClickListener(){
  $("#add-train").on("click", function(event) {
    event.preventDefault();

    // Grabs user input
    var trainName = $("#train-name").val().trim();
    var destination = $("#destination").val().trim();
    var trainStart = moment($("#fst-train-time").val().trim(), "HH:mm:ss").format("HH:mm:ss");
    var frequency = $("#frequency").val().trim();

    if(trainName.length==0 || destination.length==0 || trainStart.length==0 || frequency.length==0){
      // Alert
      alert("Please fill in all the information.");
      return;
    }

    // Creates local "temporary" object for holding employee data
    var newTrain = {
      name: trainName,
      destination: destination,
      start: trainStart,
      frequency: frequency
    };

    // Uploads employee data to the database
    database.ref().push(newTrain);

    // Alert
    alert("Train successfully added");

    // Clears all of the text-boxes
    $("#train-name").val("");
    $("#destination").val("");
    $("#fst-train-time").val("");
    $("#frequency").val("");
  });
}

//refresh train schedule dashboard upon record been added in DB
function addDBAddTrainListener(){
  database.ref().on("child_added", function(childSnapshot, prevChildKey) {
  //console.log(childSnapshot.val());

  //NOte: should not use prevChildKey as it is null on init 
  //then on record added event, it is the key of the reord in the list
  //before the added one
  var recordKey = childSnapshot.key;  //should not use prevChildKey
  var trainName = childSnapshot.val().name;
  var destination = childSnapshot.val().destination;

  var trainInfo = {
      start: childSnapshot.val().start, 
      frequency: childSnapshot.val().frequency,
      todayFirstTrainTimeStr: "",
      nextArrivalTimeStr: "",
      minsToWait: 0
  };

  //get the current time
  var currentTime = moment([]);
  //get today's first arrival time
  var todayDate = currentTime.format("YYYY-MM-DD");

  // Calculate the next arrival time and the minutes to wait
  setTrainInfo(currentTime, todayDate, trainInfo);

  // Add each train's data into the table
  $("#train-schedule-table > tbody").append("<tr id='" + recordKey + "'> <td>" + trainName + "</td><td>" 
      + destination + "</td><td>" + trainInfo.todayFirstTrainTimeStr + "</td><td>" 
      + trainInfo.frequency + "</td><td>" + trainInfo.nextArrivalTimeStr + "</td><td>" + trainInfo.minsToWait + "</td><td>"
      + '<button type="button" class="btn btn-primary" recordkey="'+ recordKey + '">x</button></td></tr>');
  });
}

//add handler for the x button been clicked in the schedule dashboard
// to delete the train from DB
function addDelBtnClickListener(){
  $('#train-schedule-table').on("click", "button", function() {
      //$("button").on("click", function() {  this won't work for the newly added button
      //get the name of the button clicked
      var trainRecordKey = $(this).attr("recordkey");
      console.log("To remov the train with key:" + trainRecordKey);

      database.ref().child(trainRecordKey).remove();
    });
}

$(document).ready(function(){
  //Initialize Firebase
  initTrainDB();

  //get the current time for display
  var currentTime = moment([]);
  $('#current-time').text(currentTime.format());

  //fill the schedule dashboard with info from DB AND
  //add DB listener for train been added 
  addDBAddTrainListener();

  //add DB listener for Train been removed
  database.ref().on('child_removed', function(oldChildSnapshot) {
    //delete table row for the removed record
    $('#'+oldChildSnapshot.key).remove();
    console.log("removed:" + oldChildSnapshot.key);
  });

  //add listener for the add button
  addAddBtnClickListener();

  //add listener for the delete button
  addDelBtnClickListener();

  //updating "minutes to arrival" and "next train time" once every minute
  var timeCounter = setInterval(resetTrainScheduleNextArr, 60000);
});