// import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import ImageDataURI from 'image-data-uri';
import sharp from 'sharp';
import FfmpegCommand from 'fluent-ffmpeg'
import fs from 'fs';
import datauri from 'datauri'
import { json } from '@sveltejs/kit';
// export const POST = (({ url }) => {
//   const min = Number(url.searchParams.get('min') ?? '0');
//   const max = Number(url.searchParams.get('max') ?? '1');
 
//   const d = max - min;
 
//   if (isNaN(d) || d < 0) {
//     throw error(400, 'min and max must be numbers, and min must be less than max');
//   }
 
//   const random = min + Math.random() * d;
 
//   return new Response(String(random));
// }) satisfies RequestHandler;

export const POST = (async({ request }) => {
  console.log(ReadableStream)
  let cmd = FfmpegCommand()
  let data = await request.json()
  let dataurlarr = data.array
  let place = data.place
  let i=data.min;
  for(const img of dataurlarr){
    await ImageDataURI.outputFile(img,`appdata/image/raw/${place}/z${i}.png`)
    let {width,height}=await sharp(`appdata/image/raw/${place}/z${i}.png`).metadata()
    let cropWidth = Math.floor(16/9*height)
    let cropLeft = Math.floor((width-cropWidth)/2)
    await sharp(`appdata/image/raw/${place}/z${i}.png`).extract({ width: cropWidth, height: height, left: cropLeft, top: 0  }).toFile(`appdata/image/raw/${place}/${i}0z.png`)
    i++
  }
  let n = 0 
  for(let j=data.min;j<i;j++){
    let {width,height}=await sharp(`appdata/image/raw/${place}/${j}0z.png`).metadata()
    let cropLeft = Math.ceil(3*width/100)
    let cropTop = Math.ceil(3.3*height/100)
    let cropWidth = Math.floor((width-cropLeft*2))
    let cropHeight= Math.floor((height-cropTop*2))
    console.log(width,cropWidth,cropHeight,cropTop,cropLeft)
    let k = 0
    while(k<10){
      await sharp(`appdata/image/raw/${place}/${j}${k}z.png`).extract({ width: cropWidth, height: cropHeight, left: cropLeft, top: cropTop}).resize({width,height}).toFile(`appdata/image/raw/${place}/${j}${k+1}z.png`)
      k++
      n++
    }
  }
  let done = await cmd.input(`appdata/image/raw/${place}/%02dz.png`)
           .inputOptions(['-start_number 30','-framerate 60'])
          //  .outputOptions(['-vcodec libx264'])
           .output(`appdata/videos/${place}.mp4`)
           .run()
  console.log(done)
  // data = data.slice(1,data.length-1)
  // const file = data['image'];

  // writeFileSync(`static/avatar.png`, file, 'base64');
  // ImageDataURI.outputFile(data,`static/image/${data.slice(random,random+4)}.png`).then(res => console.log(res))
  let fileContent=await datauri(`appdata/videos/${place}.mp4`)
  var video = fs.readFileSync('./appdata/videos/chennai.mp4')

  // await fs.readFile(`appdata/videos/${place}.mp4`, 'utf8', (err, data) => {
  //   if (err) throw err;
  //   console.log("okay",data)
  //   fileContent = data;
  // });
  // console.log(fileContent)
  return new Response(video)

}) satisfies RequestHandler;