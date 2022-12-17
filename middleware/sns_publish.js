const client = require('@aws-sdk/client-sns');

// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"
// Create SNS service object.
const snsClient = new client.SNSClient({ region: REGION });


const run = async (params) => {
    try {
        const data = await snsClient.send(new client.PublishCommand(params));
        console.log("Success in SNSClient.send:", data);
        return data; // For unit tests.
    } catch (err) {
        console.log("Error in SNSClient.send:", err.stack);
    }
};

module.exports = run;
