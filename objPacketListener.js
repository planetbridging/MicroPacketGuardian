//this is only for testing purposes will change to golang for better performance
const os = require("os");
const pcap = require("pcap");
class objPacketListener {
  listeningOn = null;
  constructor(targetIpListen) {
    this.targetIpListen = targetIpListen;
    this.lstData = this.createItemsForPorts();
    this.setupDevice();
  }
  setupDevice() {
    /*const interfaces = os.networkInterfaces();
    console.log(interfaces);
    for (var i in interfaces) {
      //console.log(interfaces[i]);
      for (var s in interfaces[i]) {
        var keys = Object.keys(interfaces[i][s]);
        //console.log(keys);
        if (keys.includes("address")) {
          if (interfaces[i][s]["address"] == this.targetIpListen) {
            console.log(interfaces[i]);
          }
        }
      }
    }
    */
    var nicDevices = pcap.findalldevs();
    for (var n in nicDevices) {
      var keys = Object.keys(nicDevices[n]);
      if (keys.includes("addresses")) {
        for (var i in nicDevices[n]["addresses"]) {
          var keys2 = Object.keys(nicDevices[n]["addresses"][i]);
          if (keys2.includes("addr")) {
            if (nicDevices[n]["addresses"][i]["addr"] == this.targetIpListen) {
              this.listeningOn = nicDevices[n]["name"];
              console.log(
                this.listeningOn,
                nicDevices[n]["addresses"][i]["addr"]
              );
            }
          }
        }
      }
    }
    this.custom3Test();
  }

  createItemsForPorts() {
    const items = [];

    for (let port = 1; port <= 65535; port++) {
      const item = {
        port: port,
        dstPort_portPacketCount: 0,
        srcPort_portPacketCount: 0,
        lstListening: [],
        // Add any other properties you need for the item
      };
      items.push(item);
    }

    return items;
  }

  async custom3Test() {
    if (this.listeningOn != null) {
      const pcapSession = pcap.createSession(this.listeningOn, "");
      pcapSession.on("packet", (rawPacket) => {
        this.processPacket(rawPacket);
      });
    } else {
      console.log("failed to start listener");
    }
  }

  processPacket(rawPacket) {
    /*const packet = pcap.decode.packet(rawPacket);
      const srcIp = packet.payload.payload.saddr;
      const dstIp = packet.payload.payload.daddr;
  
      const srcMac = packet.payload.shost;
      const dstMac = packet.payload.dhost;
  
      const tcp = packet.payload.payload.payload;
  
      try {
        const port = packet.payload.payload.payload.sport;
  
        console.log(
          `Source IP: ${srcIp}, Destination IP: ${dstIp}, Port: ${port}  
          srcMac: ${srcMac} dstMac: ${dstMac}
          tcp: ${tcp}
          `
        );
      } catch {
        console.log(packet.payload.payload.payload);
      }*/

    const packet = pcap.decode.packet(rawPacket);
    //console.log(packet);
    // Extract Ethernet information
    const srcMac = packet.payload.shost;
    const dstMac = packet.payload.dhost;
    const etherType = packet.payload.ethertype;

    // Extract IP information
    const srcIp = packet.payload.payload.saddr;
    const dstIp = packet.payload.payload.daddr;
    const ipVersion = packet.payload.payload.version;
    const protocol = packet.payload.payload.protocol;

    // Extract TCP/UDP information (if applicable)
    let srcPort, dstPort, packetData, http, seqNum, hostHeader, url;

    try {
      srcPort = packet.payload.payload.payload.sport;
      dstPort = packet.payload.payload.payload.dport;
    } catch {}

    try {
      packetData = packet.payload.payload.payload.data;
    } catch {}

    //if (packetData != null && packetData != undefined) {
    if (packet.payload.payload.protocol === 6) {
      if (Buffer.isBuffer(packet.payload.payload.payload.data)) {
        var d = packet.payload.payload.payload.data.toString();
      }
    }
    /*const httpPacket = httpParser.parseRequest(
          tcpPacket.payload.payload.data
        );
  
        if (httpPacket && httpPacket.headers && httpPacket.headers.host) {
          console.log("Website URL:", httpPacket.headers.host);
        }*/
    //}

    try {
      http = packet.payload.payload.payload.payload;
      const isRequest = http.request_line !== undefined;
      hostHeader = http.headers["host"];
      url = http.request_line.split(" ")[1];

      /*console.log(
          `HTTP ${isRequest ? "request" : "response"} from ${srcIp}:${
            packet.payload.payload.payload.sport
          } to ${dstIp}:${packet.payload.payload.payload.dport}`
        );*/
      console.log(`Host: ${hostHeader}, URL: ${url}`);
    } catch {}

    try {
      seqNum = packet.payload.payload.payload.seqno;
    } catch {}

    if (srcPort != undefined || dstPort != undefined) {
      /*console.log(
          `Source MAC: ${srcMac}, Destination MAC: ${dstMac}, EtherType: ${etherType}`
        );
        console.log(
          `Source IP: ${srcIp}, Destination IP: ${dstIp}, IP Version: ${ipVersion}, Protocol: ${protocol}`
        );
        console.log(`Source Port: ${srcPort}, Destination Port: ${dstPort}`);
        console.log(`Data: ${packetData}`);
        console.log(`seqNum: ${seqNum}`);*/
      var tmpData = {
        srcMac: srcMac,
        dstMac: dstMac,
        etherType: etherType,
        srcIp: srcIp,
        dstIp: dstIp,
        ipVersion: ipVersion,
        protocol: protocol,
        srcPort: srcPort,
        dstPort: dstPort,
        packetData: packetData,
        http: http,
        seqNum: seqNum,
        hostHeader: hostHeader,
        url: url,
      };

      try {
        var dportNumTmp = Number(dstPort);

        if (dportNumTmp >= 1 && dportNumTmp <= 65535) {
          dportNumTmp -= 1;

          this.lstData[dportNumTmp].dstPort_portPacketCount += 1;

          //lstData[dportNumTmp].lstListening.push(tmpData);

          //console.log("-------------------------");
          //console.log(lstData[dportNumTmp].portPacketCount);
        }
      } catch {}

      try {
        var srcPortNumTmp = Number(srcPort);
        if (srcPortNumTmp >= 1 && srcPortNumTmp <= 65535) {
          srcPortNumTmp -= 1;

          this.lstData[srcPortNumTmp].srcPort_portPacketCount += 1;
          //console.log(this.lstData[srcPortNumTmp]);
          //console.log(tmpData);
        }
      } catch {}
      //var jsonObj = replaceNullUndefined(tmpData);
      //insertPacket(oSql, jsonObj);
    }
  }
}

module.exports = objPacketListener;
