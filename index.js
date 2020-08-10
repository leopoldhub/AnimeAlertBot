///////////////////////////////////////////////////////////////
//             THIS CODE HAVE BEEN CREATED BY                //
//           BurnGemios3643 alias patatoe02#1499             //
//    PLEASE MENTION THE AUTHOR AND DO NOT REMOVE CREDITS    //
///////////////////////////////////////////////////////////////

//Vercode: 0.1

const Discord = require("discord.js");
const https = require("https");
const fs = require('fs');

var config = {
    "token":"NzQyMzY2MzAxMTcwODI3Mjc0.XzFEfg.U7Q3hSdL5pF30e7COkwpGD5fPWM",
    "serveurid":"734538594559066213",
    "alertchannelid":"734538594559066216",
    "managechannelid":"742356558842822687",
    "prefix":"+",
    "delaymin":"30",
    "mentions":"@here",
    "messageformat":"```css\n[%name]\n%episode```\n%url"
 };

var jsonprevious = JSON.parse("[]");

const client = new Discord.Client();

var options = {
    host: 'www.neko-sama.fr',
    path: '/',
    //port: '1338',
    headers: {
        'DNT': '1',
        'Upgrade-Insecure-Requests':'1',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 OPR/68.0.3618.191',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Sec-Fetch-Site':'none',
        'Sec-Fetch-Mode':'navigate',
        'Sec-Fetch-User':'?1',
        'Sec-Fetch-Dest':'document',
        'Accept-Language':'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    }
};

function getLastOut(){
    var req = https.request(options, function(response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });
     
        response.on('end', function () {
            var jsonpart = str.split('var lastEpisodes = ')[1].split('$(document).on(\'click\', \'.lastep-next-page:not(.disabled)\', function () {')[0];
            jsonpart = jsonpart.substr(0,jsonpart.length-7);
            var jsonepisodes = JSON.parse(jsonpart);
            jsonepisodes.reverse();
            for(var i in jsonepisodes){
                let already = false;
                for(var j in jsonprevious){
                    if(jsonepisodes[i].title == jsonprevious[j].title && jsonepisodes[i].episode == jsonprevious[j].episode){
                        already = true;
                        break;
                    }
                }
                console.log(jsonepisodes[i].title+" - "+jsonepisodes[i].episode+" => "+already);
                if(!already){
                    sendNewEpisode(jsonepisodes[i].title, jsonepisodes[i].episode, jsonepisodes[i].url, jsonepisodes[i].url_image);
                }
            }
            jsonprevious = jsonepisodes;
            savePrevious();
        });
    });
    req.end();
}

function sendNewEpisode(name, epidose, url, image){
    var guild = client.guilds.cache.get(config.serveurid);
    if(guild != undefined && guild != null){
        var channel = guild.channels.cache.get(config.alertchannelid);
        if(channel != undefined && channel != null){
            channel.send(config.mentions+'\n'+config.messageformat.replace('%name', name).replace('%episode', epidose).replace('%url', 'http://www.neko-sama.fr'+url), {files: [image]});
        }else{
            console.log('===============\nUNABLE TO ALERT DUE TO UNFOUND CHANNEL.\n===============');
        }
    }else{
        console.log('===============\nUNABLE TO ALERT DUE TO UNFOUND SERVER.\n===============');
    }
}

var runtimeTimer1;
var runtimeTimer2;

function runtime(){
    getLastOut();
    runtimeTimer1 = setTimeout(function() {
        reload();
        runtimeTimer2 = setTimeout(function() {runtime();}, 10000);
    }, config.delaymin * 3600 * 1000);
}

function savePrevious(){
    fs.writeFileSync('previous.json', JSON.stringify(jsonprevious));
}

function readPrevious(){
    if(!fs.existsSync('previous.json')) {
        fs.writeFileSync('previous.json', JSON.stringify(jsonprevious));
    }
    var contents = fs.readFileSync("previous.json");
    jsonprevious = JSON.parse(contents);
    console.log('previous alerted episodes parsed!');
}

function saveConfigs(){
    fs.writeFileSync('config.json', JSON.stringify(config));
}

function readConfigs(){
    if(!fs.existsSync('config.json')) {
        fs.writeFileSync('config.json', JSON.stringify(config));
    }
    var contents = fs.readFileSync("config.json");
    config = JSON.parse(contents);
    console.log('Config parsed!');
}

function reload(){
    readConfigs();
    readPrevious();
    setTimeout(function() {
        if(client.user == null){
            client.login(config.token);
        }
    }, 5000);
}

reload();

client.on('ready', () => {
    console.log('Discord Bot connected!');
    runtime();
});

client.on('message', (msg) => {
    if(msg.channel.id == config.managechannelid){
        if(msg.content.startsWith(config.prefix+"help")){
            msg.channel.send('```'
                +config.prefix+"prefix <nouveau prefix>"+"\n"
                +config.prefix+"delay <nouveau delay (minutes)>"+"\n"
                +config.prefix+"msgformat <format des messages envoyés>"+"\n"
                +config.prefix+"msgformat (voir le format des messages envoyés)"+"\n"
                +config.prefix+"setmanage <channel id> (set bot management channel)"+"\n"
                +config.prefix+"setalert <channel id> (set bot alert channel)"+"\n"
                +config.prefix+"setmentions <roles to mention: (Ex: @here @alertés)>"+"\n"
                +config.prefix+"reload"+"\n"
                +config.prefix+"credits"+"\n"
                +'```')
        }else if(msg.content.startsWith(config.prefix+"prefix ")){
            config["prefix"] = msg.content.split(config.prefix+"prefix ")[1];
            saveConfigs();
            msg.channel.send("le préfix a été changé par: ```"+config["prefix"]+"```");
        }else if(msg.content.startsWith(config.prefix+"delay ")){
            var arg = msg.content.split(config.prefix+"delay ")[1];
            if(!isNaN(arg)){
                if(arg > 0){
                    config["delaymin"] = arg;
                    saveConfigs();
                    msg.channel.send("le délais de rafraichissement a été définis a ```"+arg+" minutes```");
                    if(runtimeTimer1 != undefined && runtimeTimer1 != null){
                        clearTimeout(runtimeTimer1);
                    }
                    if(runtimeTimer2 != undefined && runtimeTimer2 != null){
                        clearTimeout(runtimeTimer2);
                    }
                    runtime();
                }
            }
        }else if(msg.content.startsWith(config.prefix+"reload")){
            reload();
            msg.channel.send("les configurations et les listes ont été actualisées.");
        }else if(msg.content.startsWith(config.prefix+"msgformat ")){
            config["messageformat"] = msg.content.split(config.prefix+"msgformat ")[1];
            saveConfigs();
            msg.channel.send("le format des messages a été changé par: ```"+config["messageformat"]+"```");
        }else if(msg.content.startsWith(config.prefix+"msgformat")){
            msg.channel.send("le format des messages est actuellement: ```"+config["messageformat"]+"```\nExemple d'alerte avec ce format:");
            msg.channel.send(config.mentions+'\n'+config.messageformat.replace('%name', "Nom...").replace('%episode', "Ep. 159").replace('%url', 'http://www.neko-sama.fr'+"/anime"), {files: ["https://cdn10.neko-sama.xyz/1/851612d3c194dc64724360831ff04bf8.jpg"]});
        }else if(msg.content.startsWith(config.prefix+"setmanage ")){
            config["managechannelid"] = msg.content.split(config.prefix+"setmanage ")[1];
            saveConfigs();
            msg.channel.send("l'id du channel de management du bot a été changé par: ```"+config["managechannelid"]+"```");
        }else if(msg.content.startsWith(config.prefix+"setalert ")){
            config["alertchannelid"] = msg.content.split(config.prefix+"setalert ")[1];
            saveConfigs();
            msg.channel.send("l'id du channel d'alertes du bot a été changé par: ```"+config["alertchannelid"]+"```");
        }else if(msg.content.startsWith(config.prefix+"setmentions ")){
            config["mentions"] = msg.content.split(config.prefix+"setmentions ")[1];
            saveConfigs();
            msg.channel.send("les roles a mentionner a chaque alertes ont étés définis a: ```"+config["mentions"]+"```");
        }
    }
    if(msg.content.startsWith(config.prefix+"credits")){
        msg.channel.send(
            "```css\n"
            +"[CREDITS]"+"\n"
            +"```"
            +"Code réalisé par **BurnGemios3643** alias <@262626115741286411> (patatoe02#1499)"+"\n"
            );
    }
});