const sns = require('./sns_publish')

module.exports = function (options = {}) {
    return function (req, res, next) {
        console.log('middleware-nofity starts...')

        if (req.method == "POST" && res.statusCode == 200 && req.new_pos) {
            var params = {
                Message: JSON.stringify(req.body),
                TopicArn: "arn:aws:sns:us-east-1:798948514593:e6156", //TOPIC_ARN
            };
            let ret = sns(params);
            console.log(ret)
        }

        next()

    }
}