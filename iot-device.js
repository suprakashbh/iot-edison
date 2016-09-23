var iotf = require("../");
var config = require("./device.json");

// MRAA initial

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT);

//var tempSensor = new mraa.Aio(0);
// Load Grove module
var groveSensor = require('jsupm_grove');

// Create the temperature sensor object using AIO pin 0
var temperature = new groveSensor.GroveTemp(0);
console.log("Connected Sensor--->"+temperature.name());
/////  end temp
// light sensor////
// Create the light sensor object using AIO pin 0
var light = new groveSensor.GroveLight(2);
////

// Create the Buzzer sensor object 
var upmBuzzer = require("jsupm_buzzer");// 
var myBuzzer = new upmBuzzer.Buzzer(6);
console.log("Connected Sensor--->"+myBuzzer.name());
myBuzzer.stopSound();
myBuzzer.setVolume(0.15);

//// LCD display /////
var LCD = require('jsupm_i2clcd');
var myLcd=new LCD.Jhd1313m1(6, 0x3E, 0x62); 
//// End Display ////

function startLight(color)
{
    console.log("--- start startLight color -"+color);
	var LCD = require('jsupm_i2clcd');
  
   if(color=="Pink"){
		//var myLcd = new LCD.Jhd1313m1(255,105,180); 
		myLcd.setColor(255,20,147);
   }
   if(color=="Red"){
		//var myLcd = new LCD.Jhd1313m1(255,99,71); 
		myLcd.setColor(139,0,0);
   }
   if(color=="Green"){
		//var myLcd = new LCD.Jhd1313m1(0,128,0); 
		myLcd.setColor(0,128,0);
   }
   if(color=="Blue"){
		//var myLcd = new LCD.Jhd1313m1(0,0,255); 
		myLcd.setColor(0,0,255);
   }
   if(color=="Orange"){
		//var myLcd = new LCD.Jhd1313m1(0,0,255); 
		myLcd.setColor(255,165,0);
   }
  // myLcd.home().print("Bleep");
	myBuzzer.playSound(upmBuzzer.SI, 800000);   
}

function stopLight()
{
	  console.log("--- start stopLight- and sound---");
	 // var LCD = require('jsupm_i2clcd');
	 //var myLcd = new LCD.Jhd1313m1(); 
	 myLcd.setColor(0,0,0);
	 myBuzzer.stopSound();
}



// connect with Bluemix Mqtt broker
var deviceClient = new iotf.IotfDevice(config);
//setting the log level to trace. By default its 'warn'
deviceClient.log.setLevel('debug');
publishMessage();

// publish message to AWS MQTT 
function publishMessage() {	

	deviceClient.connect();
	deviceClient.on('connect', function(){ 
		var i=0;
		console.log("connected IOT to MQTT");	
				
		setInterval(function(){
			var celsius = temperature.value();
			var lightValue= light.value();
			deviceClient.publish("myevent","json",'{ "d": { "myName": "intel-edison","temperature":' + (celsius) +', "light":'+ lightValue+'} }');	
			
		}, 4000);//Keeps publishing every 4000 milliseconds.
		
	});

	deviceClient.on("command", function (commandName, format, payload, topic) {
	
		console.log("commandName-----"+commandName);
		if(commandName == "connected-home") {
			var command = JSON.parse(payload);
			console.log("Executing command --- connected-home-->"+command.Action);			
			if(command.Action=="start"){
				startLight(command.Color);
			}else{
				stopLight();			
			}
		} else {
			console.log("not supported command");
		}
	});

	deviceClient.on('reconnect', function(){ 

		console.log("Reconnected!!!");
	});

	deviceClient.on('disconnect', function(){
	  console.log('Disconnected from IoTF');
	});

	deviceClient.on('error', function (argument) {
		console.log(argument);
	});

}
;
