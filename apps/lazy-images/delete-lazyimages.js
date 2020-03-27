const AWS = require("aws-sdk");
const secret = require('./inc/secret.json');

exports.handler = (event, context, callback) => {
    console.log(event);
    const s3 = new AWS.S3();
    const sourceBucket = secret.sourceBucket;
    const destinationBucket = secret.destinationBucket;

    var params = {
      Bucket: sourceBucket,
      Delete: { // required
        Objects: [ // required
          {
            Key: objectKey // required
          }
        ],
      },
    };
    s3.deleteObjects(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else console.log('delete', data);
      var deleteparams = {
        Bucket: destinationBucket,
        Delete: { // required
          Objects: [ // required
            {
              Key: objectKey // required
            }
          ],
        },
      };
      s3.deleteObjects(deleteparams, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log('delete', data);
      });
    });
  }
