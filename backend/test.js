const dns = require("dns").promises;

(async() => {
    try {
        const records = await dns.resolveSrv("_mongodb._tcp.cluster0.ol3lnz1.mongodb.net");
        console.log(records);
    } catch (err) {
        console.error(err);
    }
})();