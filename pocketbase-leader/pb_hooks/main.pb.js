onTerminate((e) => {
  console.log("[custom hook] PocketBase is shutting down");

  e.next();
});

onRecordAfterCreateSuccess((e) => {
  const recordsCount = $app.countRecords("users");
  if (recordsCount === 1) {
    let globalUserPermissionsCollection = $app.findCollectionByNameOrId("globalUserPermissions");

    let globalUserPermissionsRecord = new Record(globalUserPermissionsCollection);
    globalUserPermissionsRecord.set("userId", e.record.id);
    globalUserPermissionsRecord.set("role", "admin");
    globalUserPermissionsRecord.set("status", "approved");

    $app.save(globalUserPermissionsRecord);
  }

  e.next();
}, "users");
