const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("plannerDesktop", {
  platform: process.platform,
});
