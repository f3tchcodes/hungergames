import pm2 from "pm2";

export async function shutdown() {
    pm2.connect(err => {
        if (err) { console.log(err); process.exit(1); }

        const pmId = process.env.pm_id!;
        pm2.stop(pmId, stopErr => {
            if (stopErr) return console.log(stopErr);
            pm2.disconnect();
        });
    });
}
