var cron = require('cron');

var job1 = new cron.CronJob('* * * * *', function() {
    console.log('every min');
});
job1.start();

var job2 = new cron.CronJob('0 * * * *', function() {
    console.log('every min');
});
job2.start();