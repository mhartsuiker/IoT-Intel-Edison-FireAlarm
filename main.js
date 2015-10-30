/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting

var GROVE = require("jsupm_grove");
var BUZZER = require("jsupm_buzzer");
//var SPEAKER = require("jsupm_grovespeaker");
var HTTP = require("http");
var MQTT = require("mqtt");

var sensor = null,
    buzzer = null,
    //speaker = null,
    button = null,
    interval = null,
    client = null,
    CLIENTID = null,
    TOPIC = null,
    URL = null;

var constants = {
    'MAX_TEMPERATURE': 27,
    'PIN': {
        'TemperatureSensor': 0, // A0
        'Buzzer': 5, // D5
        'Button': 3, // D3
        'Speaker': 2 // A2
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
    },
    'MACADDRES': {
        'ADDRESS': '784b87a5a8b4'
    },
    'MQTT': {
        'ORGANISATION': 'hy07fr',
        'SENSORTYPE': 'tempsensor',
        'DEVICEID': 'tempsensor_1',
        'PROTOCOL': 'mqtt',
        'BROKER': '.messaging.internetofthings.ibmcloud.com',
        'PORT': '1883',
        'AUTHMETHOD': 'use-token-auth',
        'AUTHTOKEN': 'ye6QXPs)F)FIIvYcz!'
    }

};

function setup() {
    // GROVE Kit A0 Connector --> Aio(0)
    sensor = new GROVE.GroveTemp(constants.PIN.TemperatureSensor);
    // GROVE Kit D7 Connector --> Gpio(7)
    button = new GROVE.GroveButton(constants.PIN.Button);    
    // GROVE Kit D5 Connector --> Gpio(5)
    buzzer = new BUZZER.Buzzer(constants.PIN.Buzzer);
    buzzer.stopSound();
//    speaker = new SPEAKER.GroveSpeaker(constants.PIN.Speaker);
}

// Read data from the sensor
function readSensorData() { 
    var value = sensor.value();  
    return value;   
}

function readTemperature() {
    var buttonState = button.value();
    if (buttonState == 1) {
        buzzer.stopSound();
        clearInterval(interval);
        log(constants.LOGLEVELS.INFO, constants.MESSAGES.Shutdown);
        client.end();
    } else {
        var temperature = readSensorData();
        
        if (temperature > constants.MAX_TEMPERATURE) {
            buzzer.playSound(BUZZER.DO,100);
//            speaker.playSound('c', true, "med");
            log(constants.LOGLEVELS.WARNING, constants.MESSAGES.MaxTemperature + temperature);
            client.publish(TOPIC, '{"d": {"id": ' + constants.MQTT.DEVICEID + ', "lat": "0" , "lng":"0", "temp": ' + temperature + '}}');

            '{"d": {"id": ' + constants.MQTT.DEVICEID + ', "lat": "0" , "lng":"0", "temp": ' + temperature + '}}'
        }
        else {
            buzzer.stopSound();
            log(constants.LOGLEVELS.INFO, constants.MESSAGES.Temperature + temperature);
            client.publish(TOPIC, '{"d": {"id": ' + constants.MQTT.DEVICEID + ', "lat": "0" , "lng":"0", "temp": ' + temperature + '}}');
        }
    }
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

function setupMQTT() {
    CLIENTID = 'd:' + constants.MQTT.ORGANISATION + ':' + constants.MQTT.SENSORTYPE + ':' + constants.MQTT.DEVICEID;
    URL = constants.MQTT.PROTOCOL + '://' + constants.MQTT.ORGANISATION  + constants.MQTT.BROKER + ':' + constants.MQTT.PORT;
    TOPIC = 'iot-2/evt/status/fmt/json';
    client = MQTT.connect(URL, { clientId: CLIENTID, username: constants.MQTT.AUTHMETHOD, password: constants.MQTT.AUTHTOKEN });

    log(constants.LOGLEVELS.INFO, 'clientid: ' + CLIENTID);
    log(constants.LOGLEVELS.INFO, 'url: ' + URL);
}

function start() {
    setup();
    setupMQTT();
    log(constants.LOGLEVELS.INFO, 'Application starting');
    client.on('connect', function() {
        interval = setInterval(readTemperature, 1000); // Read temperature every 10 seconds
    });
}

start();

