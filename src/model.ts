// by this
import * as fs from 'fs-extra';
// import exec
import { exec } from 'child_process';
// clear the old results
console.log('Clearing old results');
fs.removeSync('~/app_data/test_job/Outputs'); 
console.log('Running the job');
exec("/usr/bin/psaas ~/app_data/test_job/job.fgmj --validate", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
console.log("starting the keep alive process");
// iife to start the keepalive process
(function keepProcessRunning() {
    setTimeout(keepProcessRunning, 1 << 30);
  })();