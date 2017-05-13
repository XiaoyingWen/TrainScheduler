/* global firebase moment */
// Steps to complete:

// 1. Initialize Firebase
// 2. Create button for adding new train schedules - then update the html + update the database
// 3. Create a way to retrieve train schedules from the train database.
// 4. Create a way to calculate the next arrival time for the trains. Using difference between start and current time.
//    Then use moment.js formatting to set difference in current time and the scheduled arrival time.
// 5. update the schedule board

/*var trains = [
  {name: "Thomas",
    destination: "Knapford",
    start:"03:30:00",  //14:41:58-04:00
    frequency: 30},
   {name: "James",
    destination: "Elsbridge",
    start:"04:10:00",  //14:41:58-04:00
    frequency: 45},
   {name: "Gorden",
    destination: "Hackenbeck",
    start:"04:10:00",  //14:41:58-04:00
    frequency: 45},
  {name: "Percy",
    destination: "sp",
    start:"04:10:00",  //14:41:58-04:00
    frequency: 45}
];*/

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

function setTrainInfo(currentTime, todayDate, trainInfo){
   //get today's first arrival time
    var todayFirstTrainTimeStr = "";
    if(trainInfo.todayFirstTrainTimeStr.length == 0){
      todayFirstTrainTimeStr = todayDate + "T" + trainInfo.start;
      trainInfo.todayFirstTrainTimeStr = todayFirstTrainTimeStr;
    } else {
      todayFirstTrainTimeStr = trainInfo.todayFirstTrainTimeStr;
    }
    console.log("todayFirstTrainTimeStr: " + todayFirstTrainTimeStr);
    var todayFirstTrainTime = moment(todayFirstTrainTimeStr, "YYYY-MM-DDTHH:mm:ss Z");

    //get the minutes past from previous arrival time
    var minsbetween = currentTime.diff(todayFirstTrainTime, "minutes");
    console.log("minsbetween:" + minsbetween);

    var nextArrivalTimeStr = trainInfo.nextArrivalTimeStr;
    var minsToWait = trainInfo.minsToWait;

    if(minsbetween > 0){
      //get the time for wait in minutes
      var minsPast = minsbetween % trainInfo.frequency;
      console.log("mins pass from previous arrival time:" + minsPast);
      minsToWait = trainInfo.frequency - minsPast;
      console.log("minsToWait:" + minsToWait);

      //get the next arrival time by adding the number of trans frequency x frequency
      //var nextArrivalTime = currentTime.add(minsToWait, "minutes"); //this will keep the ss in the arr
      var indexOfNextTrain = Math.ceil(minsbetween / trainInfo.frequency) ;
      console.log("numOfTrainPast:" + indexOfNextTrain); 
      var nextArrivalTime = todayFirstTrainTime.add(trainInfo.frequency * indexOfNextTrain, "minutes");
      nextArrivalTimeStr = nextArrivalTime.format("YYYY-MM-DDTHH:mm:ss")
      console.log("nextArrTime:" + nextArrivalTimeStr); 
    } else{
      minsToWait = Math.abs(minsbetween);
      nextArrivalTimeStr = todayFirstTrainTimeStr;
    }
    trainInfo.nextArrivalTimeStr = nextArrivalTimeStr;
    trainInfo.minsToWait = minsToWait;
}

function resetTrainScheduleNextArr(){
  //get the current time
  var currentTime = moment([]);
  console.log("resetTrainScheduleNextArr ------ currentTime: " + currentTime.format());
  $('#current-time').text(currentTime.format());
  
  //get today's first arrival time
  var todayDate = currentTime.format("YYYY-MM-DD");
  console.log("today's Date: " + todayDate);

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

function refreshTrainScheduleBoard(){
  //get the current time
  var currentTime = moment([]);
  console.log("refreshTrainScheduleBoard ------ currentTime: " + currentTime.format());
  $('#current-time').text(currentTime.format());

  //get today's first arrival time
  var todayDate = currentTime.format("YYYY-MM-DD");
  console.log("today's Date: " + todayDate);

  $.each(trains, function(index, train){
    var trainInfo = {
      start: train.start, 
      frequency: train.frequency,
      todayFirstTrainTimeStr: "",
      nextArrivalTimeStr: "",
      minsToWait: 0
    };
    setTrainInfo(currentTime, todayDate, trainInfo);
    $("#train-schedule-table > tbody").append("<tr><td>" + train.name + "</td><td>" 
      + train.destination + "</td><td>" + trainInfo.todayFirstTrainTimeStr + "</td><td>" 
      + train.frequency + "</td><td>" + trainInfo.nextArrivalTimeStr + "</td><td>" + trainInfo.minsToWait + "</td><td>"
      + '<button type="button" class="btn btn-primary">x</button></td></tr>');
  });
}

function addTrain(){
  event.preventDefault();
  // Grabs user input
  var trainName = $("#train-name").val().trim();
  var destination = $("#destination").val().trim();
  var trainStart = moment($("#fst-train-time").val().trim(), "HH:mm:ss").format("HH:mm:ss");
  var frequency = $("#frequency").val().trim();

  // Creates local "temporary" object for holding employee data
  var newTrain = {
    name: trainName,
    destination: destination,
    start: trainStart,
    frequency: frequency
  };

  // Uploads employee data to the database
  database.ref().push(newTrain);

  // Logs everything to console
  console.log(newTrain.name);
  console.log(newTrain.destination);
  console.log(newTrain.start);
  console.log(newTrain.frequency);

  // Alert
  alert("Train successfully added");

  // Clears all of the text-boxes
  $("#train-name").val("");
  $("#destination").val("");
  $("#fst-train-time").val("");
  $("#frequency").val("");
}

function addDBAddTrainListener(){
  database.ref().on("child_added", function(childSnapshot, prevChildKey) {
  console.log('Event------add child ------------'+ prevChildKey);

  console.log(childSnapshot.val());

  // Store everything into a variable.
  var trainName = childSnapshot.val().name;
  var destination = childSnapshot.val().destination;

  var trainInfo = {
      start: childSnapshot.val().start, 
      frequency: childSnapshot.val().frequency,
      todayFirstTrainTimeStr: "",
      nextArrivalTimeStr: "",
      minsToWait: 0
  };

  // Train Info
  console.log(trainName);
  console.log(destination);
  console.log(trainInfo.start);
  console.log(trainInfo.frequency);

  //get the current time
  var currentTime = moment([]);
  console.log("refreshTrainScheduleBoard ------ currentTime: " + currentTime.format());

  //get today's first arrival time
  var todayDate = currentTime.format("YYYY-MM-DD");
  console.log("today's Date: " + todayDate);

  // Calculate the next arrival time and the minutes to wait
  setTrainInfo(currentTime, todayDate, trainInfo);

  // Add each train's data into the table
  $("#train-schedule-table > tbody").append("<tr><td>" + trainName + "</td><td>" 
      + destination + "</td><td>" + trainInfo.todayFirstTrainTimeStr + "</td><td>" 
      + trainInfo.frequency + "</td><td>" + trainInfo.nextArrivalTimeStr + "</td><td>" + trainInfo.minsToWait + "</td><td>"
      + '<button type="button" class="btn btn-primary">x</button></td></tr>');
  });
}

$(document).ready(function(){
  // 1. Initialize Firebase
  initTrainDB();

  //get the current time
  var currentTime = moment([]);
  $('#current-time').text(currentTime.format());

  //fill the schedule dashboard with info from DB
  //add listener to db record add event 
  addDBAddTrainListener();

  // 2. Button for adding Employees
  $("#add-train").on("click", function(event) {
    event.preventDefault();
    addTrain();
  });

  //refreshTrainScheduleBoard();

  //refresh the the next arrival time and minutes to wait every 1 munite
  var timeCounter = setInterval(resetTrainScheduleNextArr, 60000);
});