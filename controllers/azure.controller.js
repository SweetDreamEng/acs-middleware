var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

const { PgClient } = require('pg');

const { connectionString } = require('../config');

function receiveFeedback(err, receiver){
  receiver.on('message', function (msg) {
    // console.log('Feedback message:')
    // console.log(msg.getData().toString('utf-8'));
  });
}

module.exports = {
  sendMessage: function(req, res) {
    try {
      console.log(req.body);
      if (!connectionString) {
        console.log('Please set the connectionString environment variable.');
        return res.status(400).json({
          message: "Connection string required!"
        })
      }

      if (!req.body.targetDevice) {
        console.log('Please give pass a target device id as argument to the script');
        return res.status(400).json({
          message: "Target device required!"
        })
      }

      var serviceClient = Client.fromConnectionString(connectionString);

      serviceClient.open(function (err) {
        if (err) {
          console.error('Could not connect: ' + err.message);
          return res.status(400).json({
            message: "Could not connect"
          })
        } else {
          // console.log('Client connected');

          serviceClient.getFeedbackReceiver(receiveFeedback);
          var message = new Message(JSON.stringify(req.body.requestJson));
          message.ack = 'full';
          message.messageId = "My Message ID";

          // console.log('Sending message: ' + message.getData());
          serviceClient.send(req.body.targetDevice, message, function (err) {
            if (err) {
              console.error(err.toString());
              return res.status(400).json({
                message: err.toString()
              })
            } else {
              // console.log('sent c2d message');
              return res.status(200).json({
                message: "sent c2d message"
              })
            }
          });
        }
      });
    } catch (err) {
      console.log(err)

      return res.status(400).json({
        error: 'Error'
      })
    }
  }
};