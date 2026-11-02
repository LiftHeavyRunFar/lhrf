/* Synthetic public-format fixtures only; no athlete or Garmin account data. */
const START='2026-10-30T07:00:00.000Z';
const epoch=Date.UTC(1989,11,31),stamp=Date.parse(START)/1000-epoch/1000;
function crc(bytes){let value=0;for(const b of bytes){value^=b;for(let i=0;i<8;i++)value=(value&1)?(value>>>1)^0xa001:value>>>1;}return value;}
const u16=n=>[n&255,n>>>8&255],u32=n=>[n&255,n>>>8&255,n>>>16&255,n>>>24&255];
function fit({hr=180,elapsed=2400,timer=1800,moving=1700,distance=6000,truncated=false,corrupt=false,developer=false,compressed=false,omit=[],multiSession=false}={}){
 const body=[],definition=(local,global,fields)=>body.push(0x40|local,0,0,...u16(global),fields.length,...fields.flat());
 definition(0,0,[[0,1,0]]);body.push(0,4);
 const sessionFields=[[2,4,134],[5,1,0],[7,4,134],[8,4,134],[9,4,134],[16,1,2],[17,1,2],[59,4,134]].filter(([num])=>!omit.includes(num));
 const values={2:stamp,5:1,7:elapsed*1000,8:timer*1000,9:distance*100,16:hr,17:Math.min(254,hr+10),59:moving*1000};
 definition(1,18,sessionFields);const session=[1,...sessionFields.flatMap(([num,size])=>size===4?u32(values[num]):[values[num]])];body.push(...session);if(multiSession)body.push(...session);
 definition(2,20,[[253,4,134],[5,4,134],[3,1,2]]);
 body.push(2,...u32(stamp),...u32(100*100),hr,2,...u32(stamp+elapsed),...u32(distance*100),Math.min(254,hr+10));
 if(developer){body.push(0x63,0,0,...u16(20),1,253,4,134,1,0,1,0,3,...u32(stamp+elapsed),7);}
 if(compressed)body.push(0x80);
 const header=[14,32,...u16(2100),...u32(body.length),46,70,73,84];header.push(...u16(crc(header)));
 const bytes=[...header,...body];bytes.push(...u16(crc(bytes)));
 if(corrupt)bytes[bytes.length-4]^=0x20;
 return Buffer.from(truncated?bytes.slice(0,-5):bytes);
}
function tcx({id=START,seconds=1800,elapsed=2400,distance=6000}={}){return `<?xml version="1.0"?><TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities><Activity Sport="Running"><Id>${id}</Id><Lap StartTime="${id}"><TotalTimeSeconds>${seconds}</TotalTimeSeconds><DistanceMeters>${distance}</DistanceMeters><AverageHeartRateBpm><Value>180</Value></AverageHeartRateBpm><MaximumHeartRateBpm><Value>190</Value></MaximumHeartRateBpm><Track><Trackpoint><Time>${id}</Time><DistanceMeters>100</DistanceMeters><HeartRateBpm><Value>180</Value></HeartRateBpm></Trackpoint><Trackpoint><Time>${new Date(Date.parse(id)+elapsed*1000).toISOString()}</Time><DistanceMeters>${distance}</DistanceMeters><HeartRateBpm><Value>190</Value></HeartRateBpm></Trackpoint></Track></Lap></Activity></Activities></TrainingCenterDatabase>`;}
function gpx({id=START,elapsed=2400}={}){return `<?xml version="1.0"?><gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>Synthetic historical run</name><trkseg><trkpt lat="51.5" lon="-0.1"><time>${id}</time></trkpt><trkpt lat="51.51" lon="-0.1"><time>${new Date(Date.parse(id)+elapsed*1000).toISOString()}</time></trkpt></trkseg></trk></gpx>`;}
module.exports={START,fit,tcx,gpx,crc};
