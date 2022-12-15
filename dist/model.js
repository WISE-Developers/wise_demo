"use strict";
// iife to start the service
(async function () {
    console.clear();
    // create a new instance of the service
    console.log("Creating a new instance of the service");
    const idle = () => {
        console.log("Idle");
        const test = true;
        return new Promise((resolve) => {
            if (!test) {
                resolve('test');
            }
        });
    };
    await idle();
    console.log("Done");
})();
