/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting

var GROVE = require("jsupm_grove");
//var BUZZER = require("jsupm_buzzer");
var SPEAKER = require("jsupm_grovespeaker");
var HTTP = require("http");

var sensor = null;
//var buzzer = null;
var speaker = null;
var button = null;
var interval = null;

var constants = {
    'MAX_TEMPERATURE': 25,
    'PIN': {
        'TemperatureSensor': 0,
        'Buzzer': 6,
        'Button': 3,
        'Speaker': 2
    },
    'MESSAGES': {
        'Shutdown': 'Device shutting down..',
        'Temperature': 'Celsius Temperature: ',
        'MaxTemperature': 'Max temperature reached:  '
    },
    'LOGLEVELS': {
        'INFO': 'INFO',
        'ERROR': 'ERROR',
        'WARNING': 'WARNING'
    }
};

function setup() {
    // GROVE Kit A0 Connector --> Aio(0)
    sensor = new GROVE.GroveTemp(constants.PIN.TemperatureSensor);
    // GROVE Kit D7 Connector --> Gpio(7)
    button = new GROVE.GroveButton(constants.PIN.Button);    
    // GROVE Kit D3 Connector --> Gpio(3)
//    buzzer = new BUZZER.Buzzer(constants.PIN.Buzzer);
//    buzzer.stopSound();
    speaker = new SPEAKER.GroveSpeaker(constants.PIN.Speaker);
}

// Read data from the sensor
function readSensorData() { 
    var value = sensor.value();  
    return value;   
}

function readTemperature() {
    var buttonState = button.value();
    if (buttonState == 1) {
//        buzzer.stopSound();        
        clearInterval(interval);
        log(constants.LOGLEVELS.INFO, constants.MESSAGES.Shutdown);        
    } else {
        var temperature = readSensorData();
        
        if (temperature > constants.MAX_TEMPERATURE) {
//            buzzer.playSound(BUZZER.DO,100);
            speaker.playSound('c', true, "med");
            log(constants.LOGLEVELS.WARNING, constants.MESSAGES.MaxTemperature + temperature);
        }
        else {
//            buzzer.stopSound();
            log(constants.LOGLEVELS.INFO, constants.MESSAGES.Temperature + temperature);    
        }
    }
}

function setupServer() {
}

function log(level, msg) {
    switch(level) {
        case constants.LOGLEVELS.INFO:
            console.log(level + ' -> ' + msg);            
            break;
        case constants.LOGLEVELS.ERROR:
            console.log(level + ' -> ' + msg);
            break;
        case constants.LOGLEVELS.WARNING:
            console.log(level + ' -> ' + msg);            
            break;       
        default: 
            console.log(msg);          
    }
}

function start() {
    setup();
    setupServer();
    interval = setInterval(readTemperature, 1000);
}

start();

