const BootBot = require('bootbot');
const APP_TOKEN = '';


const bot = new BootBot({
  accessToken: APP_TOKEN,
  verifyToken: '',
  appSecret: ''
});

// idle interval
const interval = 10000;

// TODO: add !subscribe and !unsubscribe for notifications

const commandList = [
    '!getvs',
    '!addvs',
    '!help', 
    '!version',
    '!author',
    '!subscribe',
    '!unsubscribe',
    '!sub',
    '!unsub'
];

// List of clans looking for VS - array
let versusList = [];
// Object - user info
let versus = {};
// List of people who subscribe for notification
let subscribeList = [];



const helpText = `Naredbe koje se koriste u komunikaciji sa botom:
!getvs - dobavlja trenutnu listu ljudi koji traze VS
!addvs - postavlja vas na vs listu 
!subscribe - dobijate poruku nakon sto neko zatrazi Versus
!unsubscribe - ne primate notifikacije nakon sto neko zatrazi Versus
!help - ispisuje sve naredbe
!version - trenutna verzija bota
!author 

Napomena: add na listu traje 5 min, poslije tog morate se ponovo pojaviti.
`;

const author = `Made with <3 by KanterOnline Development team. `;

const version = `Trenutna verzija: 0.1`;

bot.setGreetingText('Pozdrav, dobrodošao na KanterOnline VS finder! ;)');

bot.setGetStartedButton((payload, chat) => {
    chat.say('Pozdrav kako vam mogu pomoći?');  
});

bot.setPersistentMenu([
    {
      type: 'postback',
      title: '!help',
      payload: 'PERSISTENT_MENU_HELP'
    }
  ]);

bot.on('postback:PERSISTENT_MENU_HELP', (payload, chat) => {
    chat.say(helpText);
});




bot.on('message', (payload, chat) => {
  const text = payload.message.text;
  if(!commandList.includes(text)){
    chat.say(`Nepoznata komanda, kucaj !help za pomoć.`);
  } 
});


bot.hear('!help', (payload,chat) => {
    chat.say(helpText);
});

bot.hear('!author', (payload,chat) => {
    chat.say(author);
});

bot.hear('!version', (payload,chat) => {
    chat.say(version);
});



bot.hear('!getvs', (payload,chat) => {
    if(versusList.length === 0){
        chat.say("Trenutno nema niko ko traži VS, budi prvi! ;)");
    }else{
        let text = '';
        versusList.forEach(function(element){
            text = ('Name: *'+ element.clanName +'* IP: *'+element.ipServera+'*\n');
        });
        chat.say('Lista svih klanova koji traze VS (ime, server): \n'+text);
    } 
});

bot.hear('!addvs', (payload, chat) => {

	const askClanName = (convo) => {
		convo.ask(`Ime klana?`, (payload, convo) => {
			const text = payload.message.text;
            convo.set('clanName', text);
			convo.say(`Ime klana: ${text}`).then(() => askServerAddress(convo));
		});
	};

	const askServerAddress = (convo) => {
		convo.ask(`Ip adresa servera?`, (payload, convo) => {
			const text = payload.message.text;
			convo.set('ipServera', text);
			convo.say(`IP servera: ${text}`).then(() => checkInfo(convo));
		});
	};

	const checkInfo = (convo) => {
		convo.say(`Ovo su informacije koje si unio, dobro provjeri:
	      - Ime klana: ${convo.get('clanName')}
	      - IP servera: ${convo.get('ipServera')}`).then(() => confirmInfo(convo));
    };
    
    const confirmInfo = (convo) => {
        convo.ask(`Da li se slazete? da/ ne`, (payload, chat) =>{
            const text = payload.message.text;
            if(text === 'da'){
                chat.getUserProfile().then((user) => {
                    id = user.id;
                    time = new Date().getTime();
                    versus = {
                        'id': id,
                        'clanName': convo.get('clanName'),
                        'ipServera': convo.get('ipServera'),
                        'timestamp': time, 
                    };   
                    versusList.push(versus);   
                    convo.say(`Uspješno si dodan na VS listu! ;) `);
                    subscribeList.forEach((subId)=>{
                       // if(subId != id)
                        bot.say(id,'Pozdrav, dobijas notifikaciju jer si se subsribe na nas sistem. Pišemo ti jer *'+ convo.get('clanName')+'* trazi vs.');
                    });
                    convo.end();
                });

            }else if(text === 'ne'){
                convo.say(`Obustavili ste dodavanje na VS listu, pokušaj ponovo :( . Keep playing.`);
                convo.end();
            }else{
                convo.say(`Nije razumljivo, pokušaj ponovo`).then(() => confirmInfo(convo));
            }
        });
    };

	chat.conversation((convo) => {
        chat.getUserProfile().then((user) => {
            versusList.forEach(function(element){
                if(element.id === user.id){
                    convo.say(`Već ste na listi, strpite se malo. :D`);
                    convo.end();                    
                }
            });
        });
		askClanName(convo);
	});
});

// Check vs list for outdated entries
setInterval(() =>{
    const currTimestamp = new Date().getTime();
    const searchTimestamp = (currTimestamp-interval);
    versusList.forEach(function(element){
        if(element.timestamp < searchTimestamp){
        	// Test time
            bot.say(element.id, `Prošlo je 10 sekundi, vas unos je smaknut zbog neaktivnosti. Ako niste pronašli versus pokušajte ponovo.`); 
            for(var i =0; i < versusList.length; i++)
                if(versusList[i].id === element.id) {
                    versusList.splice(i,1);
                    break;
                }   
        }
    });   
},10000)

bot.hear(['!subscribe','!sub'], (payload,chat) => { 

    chat.getUserProfile().then((user) => {
        id = user.id; 
        let found = 0;  

        subscribeList.forEach(function(element){
            if(element === id) found++;                   
        });

        if(found != 0){
            chat.say(`Već si na listi :/ ?`);
        }else{
            subscribeList.push(id);   
            chat.say(`Uspješno si se subscribe, primat ćeš notifikacije od sad ;) `);
            console.log(subscribeList);  
        }    
    });
});

bot.hear(['!unsubscribe','!unsub'], (payload,chat) => { 

    chat.getUserProfile().then((user) => {
        id = user.id; 
        let found = 0;  

        subscribeList.forEach(function(element){
            if(element === id) found++;                   
        });

        if(found === 0){
            chat.say(`Nisi na listi :/ ?`);
        }else{
            const index = subscribeList.indexOf(id);
            subscribeList.splice(index,1);   
            chat.say(`Uspješno si se unsubscribe, nećeš primat notifikacije od sad :D `);
            console.log(subscribeList);  
        }    
    });
});

bot.start();
