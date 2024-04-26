import fs from "fs";
import path from "path";
import archiver from "archiver";

const targets = ["160x600","300x250","300x600","336x280","728x90","970x90"];
const GG_ADS = true;
targets.forEach((target) => {
    const targetDirPath = path.join("../../", target);
    if(!fs.existsSync(targetDirPath)){
        console.error("Dont find " + targetDirPath);
        return;
    }
    let commonDirPath = "../../common";
    if(GG_ADS){
        commonDirPath += 2;
    }
    const commons = fs.readdirSync(commonDirPath);
    commons.forEach(common => {
        const filePath = path.join(commonDirPath, common);
        let file = fs.readFileSync(filePath).toString();
        if(path.extname(filePath) === ".html"){
            file = modifyIndexFile(file.toString(), target);
        }
        fs.writeFileSync(path.join(targetDirPath, common), file);
    });
    const dataJsonFile = fs.readFileSync(path.join(targetDirPath, "data.json"));
    const dataJsonOrigin = dataJsonFile.toString();
    if(GG_ADS){
        const dataJson = replaceImageDir(JSON.parse(dataJsonOrigin), "vinh/");
        fs.writeFileSync(path.join(targetDirPath, "data.json"), dataJson);
    }
    
    const zipOutDir = "../../out";
    if(!fs.existsSync(zipOutDir)) fs.mkdirSync(zipOutDir);
    const fileWS = fs.createWriteStream(path.join(zipOutDir, target + ".zip"));
    const archive = archiver("zip");
    fileWS.on('close', function () {
        console.log("ziped: " + archive.pointer() + ' total bytes');
    });
    archive.pipe(fileWS);
    if(GG_ADS){
        archive.file(path.join(targetDirPath, "index.html"), { name: "index.html" });
        archive.file(path.join(targetDirPath, "data.json"), { name: "data.json" });
    }
    else{
        archive.directory(targetDirPath, false);
    }
    archive.finalize().finally(() => {
        commons.forEach(common => {
            const filePath = path.join(targetDirPath, common);
            fs.rmSync(filePath);
        });
        fs.writeFileSync(path.join(targetDirPath, "data.json"), dataJsonOrigin);
    });
});

function modifyIndexFile(file: string, target: string){
    const [width, height] = target.split("x");
    file = file.replace(/\*1/g, width);
    file = file.replace(/\*2/g, height);
    
    return file;
}

function replaceImageDir(obj: any, imgDir: string){
    obj["assets"].forEach((asset: any) => {
        asset["u"] = imgDir;
    });

    return JSON.stringify(obj);
}