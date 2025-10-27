const { exec } = require("child_process")
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()
const {S3Client,PutObjectCommand} = require('@aws-sdk/client-s3')
const mine = require('mime-types')

const s3clint = new S3Client({
   credentials:{
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
   },
   region:process.env.AWS_BUCKET_REGION
})
 
const PROJECT_ID = process.env.PROJECT_ID

async function init(){
    console.log("exceuting script js")
    const outDirPath = path.join(__dirname,'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data',function(data){
        console.log(data.toString())
    })
    p.stdout.on('e',function(e){
        console.error('ERROR',e.toString())
    })
    p.on('close',async function(){
        console.log('Build successfull')
        const distFolderPath = path.join(__dirname,'output','dist')

        const distFolderContents = fs.readdirSync(distFolderPath,{recursive:true});

        for(const filepath of distFolderContents){
            if (fs.lstatSync(filepath.isDirectory())) continue;

            const command = new PutObjectCommand({
                Bucket:process.env.AWS_BUCKET_NAME,
                Key:`__outputs/${PROJECT_ID}/${filepath}`,
                Body:fs.createReadStream(filepath),
                ContentType:mine.lookup(filepath) || 'application/octet-stream'
            })

            await s3clint.send(command)
            console.log(`Uploaded file to S3: ${filepath}`)

        }

        console.log('All files uploaded successfully.....')

    })
}

