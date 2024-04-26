import fs from "fs";
import path from "path";
import archiver from "archiver";

const targets = ["160x600","300x250","300x600","336x280","728x90","970x90"];
// const targets = ["160x600"];
targets.forEach((target) => {
    const targetDirPath = path.join("../../", target);
    if(!fs.existsSync(targetDirPath)){
        console.error("Dont find " + targetDirPath);
        return;
    }
    const commonDirPath = "../../common";
    const commons = fs.readdirSync(commonDirPath);
    commons.forEach(common => {
        const filePath = path.join(commonDirPath, common);
        let file = fs.readFileSync(filePath).toString();
        if(path.extname(filePath) === ".html"){
            file = modifyIndexFile(file.toString(), target);
        }
        fs.writeFileSync(path.join(targetDirPath, common), file);
    });
    
    const zipOutDir = "../../out";
    if(!fs.existsSync(zipOutDir)) fs.mkdirSync(zipOutDir);
    const fileWS = fs.createWriteStream(path.join(zipOutDir, target + ".zip"));
    const archive = archiver("zip");
    fileWS.on('close', function () {
        console.log("ziped: " + archive.pointer() + ' total bytes');
    });
    archive.pipe(fileWS);
    archive.directory(targetDirPath, false);
    archive.finalize().finally(() => {
        commons.forEach(common => {
            const filePath = path.join(targetDirPath, common);
            fs.rmSync(filePath);
        });
    });
});

function modifyIndexFile(file: string, target: string){
    const [width, height] = target.split("x");
    file = file.replace(/\*1/g, width);
    file = file.replace(/\*2/g, height);
    
    return file;
}