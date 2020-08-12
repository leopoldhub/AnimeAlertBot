///////////////////////////////////////////////////////////////
//             THIS CODE HAVE BEEN CREATED BY                //
//           BurnGemios3643 alias patatoe02#1499             //
//    PLEASE MENTION THE AUTHOR AND DO NOT REMOVE CREDITS    //
///////////////////////////////////////////////////////////////

//Vercode: 0.1

const Discord = require("discord.js");
const https = require("https");
const fs = require('fs');

process.setMaxListeners(0);

var config = {
    "token":"xxxxxxxxxxxxx",
    "serveurid":"734538594559066213",
    "alertchannelid":"734538594559066216",
    "managechannelid":"742356558842822687",
    "prefix":"+",
    "delaymin":"30",
    "mentions":"@here",
    "messageformat":"```css\n[%name]\n%episode```\n%url"
 };

var jsonprevious = JSON.parse("[]");
var jsonanimelist = JSON.parse("{}");

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
    console.log('parsing');
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

function saveStaffList(){
    fs.writeFileSync('animelist.json', JSON.stringify(jsonanimelist));
}

function readStaffList(){
    if(!fs.existsSync('animelist.json')) {
        fs.writeFileSync('animelist.json', JSON.stringify(jsonanimelist));
    }
    var contents = fs.readFileSync("animelist.json");
    jsonanimelist = JSON.parse(contents);
    console.log('anime list parsed!');
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
    readStaffList();
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

var reactNumberMap = new Map();

reactNumberMap.set(0,"0⃣");
reactNumberMap.set(1,"1⃣");
reactNumberMap.set(2,"2⃣");
reactNumberMap.set(3,"3⃣");
reactNumberMap.set(4,"4⃣");
reactNumberMap.set(5,"5⃣");
reactNumberMap.set(6,"6⃣");
reactNumberMap.set(7,"7⃣");
reactNumberMap.set(8,"8⃣");
reactNumberMap.set(9,"9⃣");
reactNumberMap.set(10,"🔟");

function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
}

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
                +config.prefix+"setanime <anime id (0-10)> <nom>"+"\n"
                +config.prefix+"remanime <anime id (0-10)>"+"\n"
                +config.prefix+"setlang <anime id (0-10)> <lang id (0-10)> <nom>"+"\n"
                +config.prefix+"addseason <anime id (0-10)> <lang id (0-10)> <url>"+"\n"
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
        }else if(msg.content.startsWith(config.prefix+"setanime ")){
            var args = msg.content.split(config.prefix+"setanime ")[1].split(" ");
            if(args.length >= 2){
                if(!isNaN(args[0]) && args[0] <= 10 && args[0] >= 0){
                    var animeindex = args[0];
                    args.shift();
                    var name = "";
                    for(var arg in args){
                        name = name+" "+args[arg];
                    }
                    name = name.substring(1,name.length);
                    jsonanimelist[animeindex] = {
                        name:name,
                        languages:{}
                    }
                    saveStaffList();
                    msg.channel.send(name+" a été ajouté avec succes a l'index "+animeindex);
                }else{
                    msg.channel.send("Erreur: merci de respecter l'utilisation de cette commande");
                }
            }
        }else if(msg.content.startsWith(config.prefix+"remanime ")){
            var args = msg.content.split(config.prefix+"remanime ")[1].split(" ");
            if(args.length >= 1){
                if(!isNaN(args[0]) && args[0] <= 10 && args[0] >= 0){
                    var animeindex = args[0];
                    if(jsonanimelist[animeindex] != undefined && jsonanimelist[animeindex] != null){
                        delete jsonanimelist[animeindex];
                        saveStaffList();
                        msg.channel.send("l'animé a l'index "+animeindex+" a été supprimé avec succes");
                    }else{
                        msg.channel.send("Erreur: l'index ne correspond a aucun animé");
                    }
                }else{
                    msg.channel.send("Erreur: merci de respecter l'utilisation de cette commande");
                }
            }
        }else if(msg.content.startsWith(config.prefix+"setlang ")){
            var args = msg.content.split(config.prefix+"setlang ")[1].split(" ");
            if(args.length >= 3){
                if(!isNaN(args[0]) && args[0] <= 10 && args[0] >= 0 && !isNaN(args[1]) && args[1] <= 10 && args[1] >= 0){
                    var animeindex = args[0];
                    var langindex = args[1];
                    args.shift();
                    args.shift();
                    var lngname = "";
                    for(var arg in args){
                        lngname = lngname+" "+args[arg];
                    }
                    lngname = lngname.substring(1,lngname.length);
                    if(jsonanimelist[animeindex] != undefined && jsonanimelist[animeindex] != null){
                        jsonanimelist[animeindex]["languages"][langindex] = {
                            name:lngname,
                            seasons:[]
                        }
                        saveStaffList();
                        msg.channel.send("la langue "+lngname+" a été ajouté avec succes a l'index "+langindex+" pour l'animé "+jsonanimelist[animeindex].name);
                    }else{
                        msg.channel.send("Erreur: l'index ne correspond a aucun animé");
                    }
                }else{
                    msg.channel.send("Erreur: merci de respecter l'utilisation de cette commande");
                }
            }
        }else if(msg.content.startsWith(config.prefix+"addseason ")){
            var args = msg.content.split(config.prefix+"addseason ")[1].split(" ");
            if(args.length >= 3){
                if(!isNaN(args[0]) && args[0] <= 10 && args[0] >= 0 && !isNaN(args[1]) && args[1] <= 10 && args[1] >= 0){
                    var animeindex = args[0];
                    var langindex = args[1];
                    args.shift();
                    args.shift();
                    var url = "";
                    for(var arg in args){
                        url = url+" "+args[arg];
                    }
                    url = url.substring(1,url.length);
                    if(jsonanimelist[animeindex] != undefined && jsonanimelist[animeindex] != null){
                        if(jsonanimelist[animeindex]["languages"][langindex] != undefined && jsonanimelist[animeindex]["languages"][langindex] != null){
                            jsonanimelist[animeindex]["languages"][langindex]["seasons"].push(url);
                            saveStaffList();
                            msg.channel.send("la saison "+url+" a été ajouté avec succes a la langue "+jsonanimelist[animeindex]["languages"][langindex].name+" pour l'animé "+jsonanimelist[animeindex].name);
                        }else{
                            msg.channel.send("Erreur: l'index ne correspond a aucune langue");
                        }
                    }else{
                        msg.channel.send("Erreur: l'index ne correspond a aucun animé");
                    }
                }else{
                    msg.channel.send("Erreur: merci de respecter l'utilisation de cette commande");
                }
            }
        }
    }
    if(msg.content.startsWith(config.prefix+"credits")){
        msg.channel.send(
            "```css\n"
            +"[CREDITS]"+"\n"
            +"```"
            +"Code réalisé par **BurnGemios3643** alias <@262626115741286411> (patatoe02#1499)"+"\n"
            );
    }else if(msg.content == config.prefix+"a"){
        var message = "";
        for(var i in jsonanimelist){
            let maxseasons = 0;
            let languages = "";
            for(var lng in jsonanimelist[i].languages){
                maxseasons = maxseasons < jsonanimelist[i].languages[lng].seasons.length?jsonanimelist[i].languages[lng].seasons.length:maxseasons;
                languages = languages+", "+jsonanimelist[i].languages[lng].name;
            }
            languages = languages.substring(2, languages.length);
            message = message+reactNumberMap.get(parseInt(i))+" - "+jsonanimelist[i].name+" - "+maxseasons+" saison(s) ["+languages+"]\n";
        }
        msg.channel.send(message).then(function (sended) {
            for(var i in jsonanimelist){
                sended.react(reactNumberMap.get(parseInt(i)));
            }
            sended.awaitReactions((reaction, user) => user.id != sended.author.id, { max: 1, time: 30000 }).then(collected => {
                var lngmsg = "Choisissez votre langue:\n";
                for(var lng in jsonanimelist[getByValue(reactNumberMap,collected.first().emoji.name)].languages){
                    lngmsg = lngmsg+reactNumberMap.get(parseInt(lng))+" "+jsonanimelist[getByValue(reactNumberMap,collected.first().emoji.name)].languages[lng].name+"\n";
                }
                sended.channel.send(lngmsg).then(function (sendedLang) {
                    for(var lng in jsonanimelist[getByValue(reactNumberMap,collected.first().emoji.name)].languages){
                        sendedLang.react(reactNumberMap.get(parseInt(lng)));
                    }
                    sendedLang.awaitReactions((reaction, user) => user.id != sendedLang.author.id, { max: 1, time: 30000 }).then(ncollected => {
                        var seasonSelectMessage = jsonanimelist[getByValue(reactNumberMap,collected.first().emoji.name)].name+" - "+jsonanimelist[getByValue(reactNumberMap,collected.first().emoji.name)].languages[getByValue(reactNumberMap,ncollected.first().emoji.name)].name+"\n";
                        var seasonlist = jsonanimelist[getByValue(reactNumberMap,collected.first().emoji.name)].languages[getByValue(reactNumberMap,ncollected.first().emoji.name)].seasons;
                        for(var i in seasonlist){
                            let index = parseInt(i)+1;
                            seasonSelectMessage = seasonSelectMessage+"saison "+reactNumberMap.get(parseInt(index))+" : "+seasonlist[i]+"\n";
                        }
                        sendedLang.channel.send(seasonSelectMessage).then(function (last) {
                            last.suppressEmbeds(true);
                        });
                        sended.delete();
                        sendedLang.delete();
                    }).catch(() => {
                        sended.delete();
                        sendedLang.delete();
                    });
                });
            }).catch(() => {
                sended.delete();
            });
        });
    }
});