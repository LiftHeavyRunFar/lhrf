// Compile install icons from the exact approved artwork embedded in the app.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const artwork=html.match(/class="lhrf-logo-image"[^>]*src="(data:image\/png;base64,[^"]+)"/)[1];
const svg=width=>`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><rect width="512" height="512" fill="#000000"/><image x="${(512-width)/2}" y="${(512-width*315/744)/2}" width="${width}" height="${width*315/744}" xlink:href="${artwork}"/></svg>`;
(async()=>{fs.writeFileSync(path.join(root,'icon-lhrf.svg'),svg(440));for(const [file,size,width]of [['icon-lhrf-192-v2.png',192,440],['icon-lhrf-512-v2.png',512,440],['icon-lhrf-maskable-v2.png',512,360]])await sharp(Buffer.from(svg(width))).resize(size,size).png({palette:true,colours:128,compressionLevel:9}).toFile(path.join(root,file));console.log('Compiled approved wordmark into install icons.');})().catch(e=>{console.error(e);process.exitCode=1});
