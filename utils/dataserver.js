'use strict';
const excelToJson = require('convert-excel-to-json');
const {findYoungestDate,formatDate,sanitizedNumber,convertLocaleDate,currencyFormat,calculateDueDates } = require('./common'); 
const {tableSchema} = require('../model/data_model');
const fs = require('fs');
const {readJSON,writeJSON,logFilePath} = require('./jsonLogger');

const path = require('path');
const dotenv = require('dotenv');
const { log } = require('console');
dotenv.config({ path: path.join( __dirname,'../', '.env') });
const fileName = process.env.FILENAME;
const sheetName = process.env.SHEETNAME;
const dirLocation = path.join( __dirname,'../');

function readData() {    
    try{
        var result;
        result = excelToJson({
            sourceFile: dirLocation+fileName,
            sheets: [sheetName],
            columnToKey: tableSchema
        });
        if(result[sheetName].length>0)
        {
            console.log('----------------------------------------------------------');
            console.log('Sukses membaca file :  File dan sheet ditemukan');
            console.log('Nama file           : ',fileName);
            console.log('Nama sheet          : ',sheetName);
            console.log('----------------------------------------------------------');
            return result;
        }else{
            console.log('----------------------------------------------------------');
            console.log('Error                          :  nama sheet tidak ditemukan');
            console.log('Pastikan terdapat sheet        : ',sheetName);
            console.log('----------------------------------------------------------');   
            return null;
        }
    } catch(error) {
        if(error.errno==-4058){
            console.log('----------------------------------------------------------');
            console.log('Error                          :  no such file or directory');
            console.log('Pastikan terdapat file         : ',fileName);
            console.log('dan berada pada folder berikut : ',error.path.substr(0,error.path.length-fileName.length));
            console.log('----------------------------------------------------------');
        }else{
            console.error('errror',JSON.stringify(error));
        }
        return null;
    }
}

async function getAllData() {
    try {
        // wait for data to be read
        var tempData = await readData();
        // filter for valid transaction by date
        const filteredDataByRealitationDate = tempData[sheetName].filter(i => {
            return i.tanggal_realisasi instanceof Date;
        });
        filteredDataByRealitationDate.forEach(e => {
            var tgl_realisasi = Date.parse(e.tanggal_realisasi);
            var tgl_awal_tempo = new Date(formatDate(tgl_realisasi,1));
            var year = tgl_awal_tempo.getFullYear();
            var month = tgl_awal_tempo.getMonth();
            tgl_awal_tempo.setMonth(month+1);
            tgl_awal_tempo.setDate(tgl_awal_tempo.getDate()+1)
            e.last_due_date = calculateDueDates(tgl_awal_tempo,'monthly',e.jangka_waktu)

            // format date into readable
            if(e.hasOwnProperty('tanggal_realisasi'))
            e.tanggal_realisasi = convertLocaleDate(e.tanggal_realisasi);

            // periode angsuran yg akan datang = periode_angsuran + 1 
            if(e.hasOwnProperty('periode_angsuran'))
            e.periode_angsuran = Number(e.periode_angsuran)+1

            // round the number
            if(e.hasOwnProperty('angsuran_pokok')){
                if(e.angsuran_pokok!=0){
                    e.angsuran_pokok = currencyFormat(Math.round(e.angsuran_pokok));
                }else{
                    delete e.angsuran_pokok;
                }
            }
            if(e.hasOwnProperty('angsuran_jasa')){
                if(e.angsuran_jasa!=0){
                    e.angsuran_jasa = currencyFormat(Math.round(e.angsuran_jasa));
                }else{
                    delete e.angsuran_jasa;
                }
            }
            if(e.hasOwnProperty('angsuran_total')){
                if(e.angsuran_total!=0){
                    e.angsuran_total = currencyFormat(Math.round(e.angsuran_total));
                }else{
                    delete e.angsuran_total;
                }
            }
            if(e.hasOwnProperty('tunggakan_pokok')){
                if(e.tunggakan_pokok!=0){
                    e.tunggakan_pokok = currencyFormat(Math.round(e.tunggakan_pokok));
                }else{
                    delete e.tunggakan_pokok;
                }
            }
            if(e.hasOwnProperty('tunggakan_jasa')){
                if(e.tunggakan_jasa!=0){
                    e.tunggakan_jasa = currencyFormat(Math.round(e.tunggakan_jasa));
                }else{
                    delete e.tunggakan_jasa;
                }
            }
            if(e.hasOwnProperty('tunggakan_total')){
                if(e.tunggakan_total!=0){
                    e.tunggakan_total = currencyFormat(Math.round(e.tunggakan_total));
                }else{
                    delete e.tunggakan_total;
                }
            }
            // sanitize phone number
            if(e.hasOwnProperty('whatsapp_peminjam'))
            e.whatsapp_peminjam = sanitizedNumber(e.whatsapp_peminjam);
        });
        return filteredDataByRealitationDate;
    } catch (error) {
        console.log('Oops, ',error);
    }
}

function getServedNotificationData(allData) {
    const today = new Date();
    var h0Data,h2Data;
    var dispartedAT = [];
    var dispartedContact = [];

    h0Data = allData.filter(item => {
        return item.tanggal_angsuran == today.getDate();
    });
    h2Data = allData.filter(item => {
        return item.tanggal_angsuran == today.getDate()+2;
    });
    h0Data.concat(h2Data).forEach(element => {
        if(element.hasOwnProperty('angsuran_total')){
            let newObject = { 
                ...element, 
                last_due_date: findYoungestDate(element.last_due_date),
                last_due_year: new Date(findYoungestDate(element.last_due_date)).getFullYear(), 
                last_due_month: new Date(findYoungestDate(element.last_due_date)).getMonth()+1, 
                type_notif:'Notifikasi Angsuran',
                notif_status:false,
                tgl_tempo:today.getFullYear().toString()+"-"+((today.getMonth()+1)<10?'0'+(today.getMonth()+1).toString():(today.getMonth()+1).toString())+"-"+element.tanggal_angsuran
            }            
            dispartedAT.push(newObject);
        }
        if(element.hasOwnProperty('tunggakan_total')){
            let newObject = { 
                ...element, 
                last_due_date: findYoungestDate(element.last_due_date),
                last_due_year: new Date(findYoungestDate(element.last_due_date)).getFullYear(), 
                last_due_month: new Date(findYoungestDate(element.last_due_date)).getMonth()+1,
                type_notif:'Notifikasi Tunggakan',
                notif_status:false,
                tgl_tempo:today.getFullYear().toString()+"-"+((today.getMonth()+1)<10?'0'+(today.getMonth()+1).toString():(today.getMonth()+1).toString())+"-"+element.tanggal_angsuran
            }
            dispartedAT.push(newObject);            
        }
    });
    dispartedAT.forEach((element,index) => {
        if(element.hasOwnProperty('whatsapp_peminjam')){
            let newObject = { 
                ...element,
                send_to:"peminjam"
            }            
            dispartedContact.push(newObject);
        }
    });
    dispartedContact.forEach((e,i)=>{
        e.idx = i
        e.send_note = ''
        e.alokasi_pinjaman = currencyFormat(e.alokasi_pinjaman)
    });

    
    if(!fs.existsSync(logFilePath())) {     
        writeJSON(logFilePath(),dispartedContact)
    }else{
        console.log('[Data Source] -  has already created in the last session.')
    }
}

module.exports = {
    getAllData: getAllData,
    getServedNotificationData:getServedNotificationData
};