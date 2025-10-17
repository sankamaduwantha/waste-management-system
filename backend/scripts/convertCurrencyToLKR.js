// MongoDB Script: Convert USD to LKR for Plastic Reduction Suggestions
// Run this script in MongoDB Shell or MongoDB Compass

// ========================================
// BACKUP FIRST (IMPORTANT!)
// ========================================
// Before running, create a backup:
// mongodump --db waste_management --collection plasticreductionsuggestions --out ./backup

// ========================================
// Conversion Rate
// ========================================
const USD_TO_LKR_RATE = 300;  // 1 USD = 300 LKR (adjust as needed)

// ========================================
// 1. View Current Values
// ========================================
print("========== CURRENT MONEY SAVED VALUES ==========");
db.plasticreductionsuggestions.find({}, { 
  title: 1, 
  moneySaved: 1 
}).forEach(doc => {
  print(`${doc.title}: $${doc.moneySaved} → Rs. ${doc.moneySaved * USD_TO_LKR_RATE}`);
});

// ========================================
// 2. Update All Suggestions (USD → LKR)
// ========================================
print("\n========== UPDATING ALL SUGGESTIONS ==========");

const result = db.plasticreductionsuggestions.updateMany(
  {},
  [{
    $set: {
      moneySaved: { $multiply: ["$moneySaved", USD_TO_LKR_RATE] }
    }
  }]
);

print(`Matched: ${result.matchedCount} documents`);
print(`Modified: ${result.modifiedCount} documents`);

// ========================================
// 3. Verify New Values
// ========================================
print("\n========== NEW VALUES (AFTER UPDATE) ==========");
db.plasticreductionsuggestions.find({}, { 
  title: 1, 
  moneySaved: 1 
}).forEach(doc => {
  print(`${doc.title}: Rs. ${doc.moneySaved.toFixed(2)}`);
});

// ========================================
// 4. Statistics
// ========================================
print("\n========== STATISTICS ==========");

const stats = db.plasticreductionsuggestions.aggregate([
  {
    $group: {
      _id: null,
      totalSuggestions: { $sum: 1 },
      totalMoneySaved: { $sum: "$moneySaved" },
      avgMoneySaved: { $avg: "$moneySaved" },
      minMoneySaved: { $min: "$moneySaved" },
      maxMoneySaved: { $max: "$moneySaved" }
    }
  }
]).toArray()[0];

print(`Total Suggestions: ${stats.totalSuggestions}`);
print(`Total Money Saved: Rs. ${stats.totalMoneySaved.toFixed(2)}`);
print(`Average Money Saved: Rs. ${stats.avgMoneySaved.toFixed(2)}`);
print(`Min Money Saved: Rs. ${stats.minMoneySaved.toFixed(2)}`);
print(`Max Money Saved: Rs. ${stats.maxMoneySaved.toFixed(2)}`);

print("\n========== CONVERSION COMPLETE! ==========");

// ========================================
// ALTERNATIVE: If you need to REVERT back to USD
// ========================================
/*
// Uncomment to revert:
db.plasticreductionsuggestions.updateMany(
  {},
  [{
    $set: {
      moneySaved: { $divide: ["$moneySaved", 300] }
    }
  }]
);
print("Reverted to USD");
*/
