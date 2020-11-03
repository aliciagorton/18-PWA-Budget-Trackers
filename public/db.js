// NO SQL MINI-PROJECT
let db;
// check for indexDB browser support
const request = indexedDB.open("budget", 1);

// create a new db request for a "budget" database.
request.onupgradeneeded = function(event) {
   const db = event.target.result;
   db.createObjectStore("pending", { autoIncrement: true });
 };
//  on success
 request.onsuccess = function(event) {
   db= event.target.result;

    // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
 };
// on error
 request.onerror = function(event) {
    console.log("Woops! " + event.target.errorCode);
  };
 
 function saveRecord(record) {
    //create a transaction on the pending db with readwrite access
   const transaction = db.transaction(["pending"], "readwrite");
   // access your pending object store
   const store = transaction.objectStore("pending");
  // add record to your store with add method.
   store.add(record);
 }
 
 function checkDatabase() {
    // open a transaction on your pending db
   const transaction = db.transaction(["pending"], "readwrite");
   // access your pending object store
   const store = transaction.objectStore("pending");
   // get all records from store and set to a variable
   const getAll = store.getAll();
 
   getAll.onsuccess = function() {
     if (getAll.result.length > 0) {
       fetch("/api/transaction/bulk", {
         method: "POST",
         body: JSON.stringify(getAll.result),
         headers: {
           Accept: "application/json, text/plain, */*",
           "Content-Type": "application/json"
         }
       })
       .then(response => response.json())
       .then(() => {
         // delete records if successful
         // if successful, open a transaction on your pending db
         const transaction = db.transaction(["pending"], "readwrite");
         const store = transaction.objectStore("pending");
         // clear all items in your store
         store.clear();
       });
     }
   };
 }

// listen for app coming back online
window.addEventListener("online", checkDatabase);

