const {getAllData,getServedNotificationData} = require('./utils/dataserver');
const {initializeWwebjs} = require('./utils/wwebbridge');

let allData;

(async () => {
    allData = await getAllData();
    getServedNotificationData(allData);
})().then(()=>{ 
    console.log('[Whatsapp Client] - preparing...');  
    initializeWwebjs();
});