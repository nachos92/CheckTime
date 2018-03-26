/**
 * Variabile globale e valori iniziali.
 */
var app = {};


app['DEBUG'] = true;
app['noScan'] = true;
app['timezoneOffset'] = 60;

app['isAndroid'] = (Ti.Platform.osname=='android') ? true : false;

app['primaGet'] = true;
//app['urlBase'] = "http://192.168.0.101:8080/";
app["urlBase"] = (app['isAndroid']) ? "http://10.0.2.2:8000/" : "http://127.0.0.1:8000/";
app['urlRicezione'] = app['urlBase'] + "checks/";
app['urlInvio'] = app['urlBase'] + "checks/dipendente/";
app['urlDaydone'] = app['urlBase'] + "checks/planning/daydone/";

app['minuti'] = 30;
app['messaggio'] = '';


var xhr = Ti.Network.createHTTPClient({
		timeout : 3000,		
		onload : function() {
			Ti.API.info("Chiamata funzione ONLOAD di xhr.");
			
			if (this.getStatus() == 200) {
				Ti.API.info("Parsing json...");
				app['json'] = JSON.parse(this.responseText);

			}
		},
		onerror: function(){
			
			//console.log("Httpclient --> Error Code: "+this.getStatus());
			
			if (app['primaGet']==false && this.getStatus() == 404)
				alert("Errore 404 - Il n_matr inserito non è valido.");
			else if (this.getStatus() == 301){
				
				Ti.UI.createAlertDialog({
					title:"Errore 301"
				}).show();
				app['primaGet'] = true;	
			}
			else {
				alert("Errore: HTTP Error "+this.getStatus());
			}	
		}
	});
/**
 * Quanti minuti prima dell'orario di inizio del giro si vuole mandare la notifica.
 */




/*
 * ----------------------------------------------------------------------inizio DICHIARAZIONE FUNZIONI
 */
/**
 * Riproduce un suono.
 */

function stampa(){
	//	var data = new Date(year, month, day, hours, minutes, seconds, milliseconds);
	var orario = new Date();
	orario.setHours(app['json'].reparti[0].orario.lun.orario.substring(0,2));
	orario.setMinutes(app['json'].reparti[0].orario.lun.orario.substring(3,5));
	var data = new Date(2018, 2, 24, 16, 35);
	var now = new Date();
	
	console.log("Data: "+data);
	console.log("Oggi: "+new Date(now-app['minuti']*60*1000));
	console.log("Orario: "+orario.getHours()+':'+orario.getMinutes());
	
	(data > now) ? console.log("Data > oggi") : console.log("Data < oggi");
}

function play(){
	var player = Ti.Media.createSound({url:"sound.mp3"});
	player.play();
	console.log("Play");
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

function setRefreshVisible(attivazione){
	if (attivazione)
		$.refresh_tab.setVisible(true);
	else
		$.refresh_tab.setVisible(false);
}

function cambiaTitolo(stringa){
	$.mainWindow.setTitle(stringa);
}

/**
 * Operazioni preliminari che sono necessarie
 * per l'uso delle Notifiche, a seconda della piattaforma
 * di utilizzo.
 */
function initNotifiche(){
	if (app['isAndroid']) {
	    Ti.API.info("Android --> Init notifiche");
	}
	else if (parseInt(Ti.Platform.version.split(".")[0]) >= 8){
		
		Ti.App.iOS.registerUserNotificationSettings({
		    types: [
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
	        ]
	    });
	    Ti.API.info("iOS --> Init notifiche");
	}
}

function suona(){
	if (app['isAndroid']){
		
	}
	else {
		var d = Ti.App.iOS.scheduleLocalNotification({
			alertAction: "update",
			alertBody: ("Ciao ciao!"),
			badge: 0,
			repeat: 'weekly',
			date: new Date(new Date().getTime()+3000),		
			sound: "/alarm.mp3"
		});
	
		d.addEventListener('click', function(){
			$.refresh_tab.setVisible(true);
		});
	}
}

/**
 * It is a try: it runs when i push a button
 */
function servizio(){
	var timestamp = new Date(new Date().getTime() + 10 * 1000);
	var data = new Date();
	
	console.log("Timestamp: "+timestamp);
	console.log("Data: "+data);
	
	//console.log("Impostazione notifica: "+ new Date(new Date().getTime() +  5*1000 ));
	
	if (app['isAndroid']){
		var ritardo_sec = 5;
		
		var notification = Titanium.Android.createNotification({
    		contentTitle: 'ATTENZIONE!',
    		contentText : ("Inizio giro controlli tra "+app['minuti']+" minuti!"),
    		contentIntent: Ti.Android.createPendingIntent({intent: Ti.Android.createIntent({})}),
    		//icon: Ti.App.Android.R.drawable.warn,
    		//number: 5,
    		when: new Date(new Date().getTime() +  5*1000 ),
    		// Sound file located at /platform/android/res/raw/sound.wav
			//sound: '/alarm.mp3'
		});
		
		// Send the notification
    	Ti.Android.NotificationManager.notify(1, notification);
    
    	// Stop the service once the notification is sent
    	//Ti.Android.stopService(serviceIntent);
		
		
		/*
		var intent = Ti.Android.createServiceIntent({
	        	url : 'serviceNotifiche.js'
	    	});
	    intent.putExtra('title' , 'ATTENZIONE!');
	    intent.putExtra('message' , ("Inizio giro controlli tra "+app['minuti']+" minuti!"));
	    intent.putExtra('timestamp', new Date(new Date().getTime() + 10 * 1000));
	   	intent.putExtra('interval', 3000);
	    Ti.Android.startService(intent);
	    */
	}
}

/**
 * Creo la notifica se data e orario attuale ("now") sono 'inferiori' alla data e l'ora
 * a cui si vuole impostare la notifica.
 *
 *  Passo l'orario di inizio del giro; deve essere quindi fatto a parte
 *  il calcolo dell'orario "ora_inizio - app['minuti']".
 * 	
 * new Date(ora_inizio-MINUTI*60*1000));
 * 
 */
function notifica(day,month,year,hh,mm){
	
	//REMINDER	var data = new Date(year, month, day, hours, minutes, seconds, milliseconds);
	
	
	var now = new Date(); 
	var data = new Date(year,month,day,hh,mm);
	
	
	
	//if (now < data){
		
	if (app['isAndroid']){
		var intent = Ti.Android.createServiceIntent({
        	url : 'serviceNotifiche.js'
    	});
    	intent.putExtra('title' , 'ATTENZIONE!');
    	intent.putExtra('message' , ("Inizio giro controlli tra "+app['minuti']+" minuti!"));
    	intent.putExtra('timestamp', new Date(data-app['minuti']*60*1000));
   		intent.putExtra('interval', 3000);
    	Ti.Android.startService(intent);
		/*
		var notification = Titanium.Android.createNotification({
    		contentTitle: 'ATTENZIONE!',
    		contentText : ("Inizio giro controlli tra "+app['minuti']+" minuti!"),
    		//contentIntent: Ti.Android.createPendingIntent({intent: Ti.Android.createIntent({})}),
    		//icon: Ti.App.Android.R.drawable.warn,
    		//number: 5,
    		when: new Date(data-app['minuti']*60*1000),
    		// Sound file located at /platform/android/res/raw/sound.wav
			//sound: Ti.Filesystem.getResRawDirectory() + 'sound.wav',
		});
		
		// Send the notification
    	Ti.Android.NotificationManager.notify(1, notification);
    
    	// Stop the service once the notification is sent
    	Ti.Android.stopService(serviceIntent);
    	*/    	
	}
	else {		
		var n = Ti.App.iOS.scheduleLocalNotification({
			alertAction: "update",
			alertBody: ("Inizio giro controlli tra "+app['minuti']+" minuti!"),
			badge: 0,
			date: new Date(data-app['minuti']*60*1000),
			repeat: 'weekly',
			sound: "/alarm.mp3"
		});					
	}		
	Ti.API.info("Allarme impostato:"+'\t'+new Date(data-app['minuti']*60*1000));		
}


/**
 * A partire da data_inizio, che si suppone essere un lunedi',
 * si impostano le notifiche per tutti i giorni della settimana.
 * 
 * Reminder: notifica(D,M,Y,hh,mm)
 */
function registraNotifiche(){
	
	var orario = new Date();
	orario.setHours(app['json'].reparti[0].orario.lun.orario.substring(0,2));
	orario.setMinutes(app['json'].reparti[0].orario.lun.orario.substring(3,5));
		
	//Azzeramento delle notifiche.
	if(app['isAndroid']) {
		// Remove all notifications sent by the application
		Titanium.Android.NotificationManager.cancelAll();
	}
	else {
		Titanium.App.iOS.cancelAllLocalNotifications();
	}
	
	for (var r=0; r<app['json'].reparti.length; r++){
			var inizio = new Date(app['json'].reparti[0].data_inizio);			
			notifica(
				(inizio.getDate()+0),
				(inizio.getMonth()),
				(inizio.getFullYear()),
				(app['json'].reparti[r].orario.lun.orario.substring(0,2)),
				(app['json'].reparti[r].orario.lun.orario.substring(3,5))
			);
			
			notifica(
				(inizio.getDate()+1),
				(inizio.getMonth()),
				(inizio.getFullYear()),
				(app['json'].reparti[r].orario.mar.orario.substring(0,2)),
				(app['json'].reparti[r].orario.mar.orario.substring(3,5))
			);
			
			notifica(
				(inizio.getDate()+2),
				(inizio.getMonth()),
				(inizio.getFullYear()),
				(app['json'].reparti[r].orario.mer.orario.substring(0,2)),
				(app['json'].reparti[r].orario.mer.orario.substring(3,5))
			);
			
			notifica(
				(inizio.getDate()+3),
				(inizio.getMonth()),
				(inizio.getFullYear()),
				(app['json'].reparti[r].orario.gio.orario.substring(0,2)),
				(app['json'].reparti[r].orario.gio.orario.substring(3,5))
			);
			
			notifica(
				(inizio.getDate()+4),
				(inizio.getMonth()),
				(inizio.getFullYear()),
				(app['json'].reparti[r].orario.ven.orario.substring(0,2)),
				(app['json'].reparti[r].orario.ven.orario.substring(3,5))
			);			
		}			
}

function cambiaCod(indexImpostazione, titolo, messaggio){
	
	$.d_sett0.setTitle(titolo);
	$.d_sett0.setMessage(messaggio);
	
	
	if(!app['isAndroid']){
		$.d_sett0.setStyle(Titanium.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);		
	}
	
	$.d_sett0.addEventListener('click', function(e){
		if (e.index == 0){
			Ti.API.info("Annullamento");
		}
		else {
			if(indexImpostazione == 0) {			
				if (app['isAndroid']){
					if ($.input.value != '')
						app['cod_op'] = $.input.value;
					
				}
				else {
					if (e.text !='')
						app['cod_op'] = e.text;
				}
					
				app['primaGet']=true;
				
				setRefreshVisible(true);
				
				app['json'] = null;
				$.elenco.setData(null);
				
				getData();
				cambiaTitolo('');
			}
			if (indexImpostazione == 1){
				if (app['isAndroid']){
					if (isNaN($.input.value)==false)
						if ($.input.value != '')
							app['minuti'] = Number($.input.value);
				}
				else{
					if (isNaN(e.text)==false){
						if (e.text != '')
							app['minuti'] = Number(e.text);
					}
					else{
						alert("Inserire un valore numerico!");
						return;
					}
				}	
			}
			if (indexImpostazione == 2){
				if (app['isAndroid']){
					if ($.input.value != '')
						app["urlBase"] = $.input.value;
				}
				else {
					if (e.text != '')
						app["urlBase"] = e.text;
				}
				app['primaGet'] = true;
				
				setRefreshVisible(true);
				
				app['json'] = null;
				$.elenco.setData(null);
				
				getData();
				cambiaTitolo("");
			}
			//alert("Modifica effettuata. Nuovo valore: "+e.text);
			
	}	
	});
	$.d_sett0.show();
	//dSetting0.show();
  
}


/**
 * Ottiene semplicemente il json. Per aggiornare le tabelle o visualizzare
 * dialog informative, si devono creare all'esterno della funzione.
 */
function getData() {

	//console.log(app['urlRicezione'].concat(app['cod_op']));
	xhr.open("GET", app['urlRicezione'].concat(app['cod_op']));
	

	try{			
		//wait(500);
		xhr.send();
		return 0;	
	}
	catch(err){
		console.log("GetData Error: "+err);
		return -1;
	}		
}

/**
 * Visualizza tramite una Dialog il messaggio costruito
 * da creaInfo().
 */
function showInfo() {
	var dialog = Ti.UI.createAlertDialog({
    message: app['messaggio'],
    title: 'Informazioni'
  });
  dialog.show();	
}

function showDialog() {
	
	if(app['isAndroid']){		
		
	}
	else{
		//$.dialog0.setMessage("Inserire codice operatore:");
		$.dialog0.setPersistent(true);
		$.dialog0.setStyle(Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);		
			
	}
}


/**
 * Richiede ed ottiene i dati, per poi costruire nuovamente la tabella.
 */
/*
 * ------------- TO-DO: aggiungere alert che chiede conferma
 * (es. "Non hai ancora terminato il giro. In questo modo cancellerai i dati salvati.")
 * prima di procedere con l'aggiornamento.
 */
function refresh() {
		
	Ti.API.info("PrimaGet --> "+app['primaGet']);
	//console.log(getData(app['primaGet']));
	//console.log(app['json']);
	
	if (makeTab() >= 0) {
		
		cambiaTitolo(app['json'].nome+' '+app['json'].cognome);
			
		if (!app['json'].reparti.length == 0){
			
			registraNotifiche();
		}
		
	}
	else {
		cambiaTitolo('');

	}
	//app['primaGet'] = false;
	setRefreshVisible(true);
}

/**
 * Controlla tutte le sezioni:
 * se per la i-esima sezione i dipendenti sono fatti, mette sez-fatto ='T'.
 */
function controlloSez(){
	
	for (i=0; i<app['json'].reparti.length; i++) {
		if (app['json'].reparti[i].fatto =='F'){
			var contatDip = 0;
			for (m=0; m<app['json'].reparti[i].dipendenti.length; m++){
				if (app['json'].reparti[i].dipendenti[m].fatto == 'T') {
					contatDip++;
					//console.log("Dipendenti fatti: "+contatDip);
				}
			}
			if (contatDip == app['json'].reparti[i].dipendenti.length) {
				app['json'].reparti[i].fatto = 'T';
				
				Ti.API.info("Reparto "+app['json'].reparti[i].nome+" finito!");
				//alert("Reparto "+app['json'].reparti[i].nome+" finito!");				
				/*
				 * Mando una richiesta all'url indicato
				 * per segnare come fatta una giornata per un reparto.
				 */
				/*
				var urlFineReparto = (
					app['urlBase'] + "checks/"+
					app['json'].n_matr + "/planning/"+
					app['json'].reparti[i].id+"/done/"
					);
				var client = Ti.Network.createHTTPClient({
					timeout: 3000,
					onerror: function(){
						alert("Errore invio (controlloSez)");
					}
				});
				
				client.open("GET",urlFineReparto, true);
				client.send();
				*/
			}
		}
	}
}


function controlloTab(){
	var contatore = 0;
	for (i=0; i<app['json'].reparti.length; i++){
		if (app['json'].reparti[i].fatto == 'T')
			contatore++;
	}
	if (contatore == app['json'].reparti.length){
		if (app['isAndroid']) alert("Giro giornaliero finito!");
		Ti.API.info("Giro finito!");	
	}
}

/**
 * Accede al json salvato e costruisce il messaggio informativo
 * costituito dall'orario dei giri-controlli, per ogni reparto
 * coinvolto.
 */
function creaInfo() {
	app['messaggio']= "";
	for (r=0; r<app['json'].reparti.length; r++){
		app['messaggio'] += 'REPARTO: '+app['json'].reparti[r].nome+'\n';
		
		if (app['json'].reparti[r].orario.lun.festivo == 'T')
			app['messaggio'] += 'lun: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'lun:'+'\t'+app['json'].reparti[r].orario.lun.orario+'\n';
		
		if (app['json'].reparti[r].orario.mar.festivo == 'T')
			app['messaggio'] += 'mar: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'mar:'+'\t'+app['json'].reparti[r].orario.mar.orario+'\n';
		
		if (app['json'].reparti[r].orario.mer.festivo == 'T')
			app['messaggio'] += 'mer: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'mer:'+'\t'+app['json'].reparti[r].orario.mer.orario+'\n';
		
		if (app['json'].reparti[r].orario.gio.festivo == 'T')
			app['messaggio'] += 'gio: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'gio:'+'\t'+app['json'].reparti[r].orario.gio.orario+'\n';
		
		if (app['json'].reparti[r].orario.ven.festivo == 'T')
			app['messaggio'] += 'ven: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'ven:'+'\t'+app['json'].reparti[r].orario.ven.orario+'\n';
		
		app['messaggio'] +='\n';
	}
}

function messaggioChiusura(){
	r = Ti.UI.createTableViewRow({
		title: "GG di chiusura."
	});
	$.elenco.setData([r]);
	creaInfo();
}

/**
 * Scandisce il json (variabile app['json']) e costruisce la tabella,
 * dotata di opportune sezioni.
 */
function makeTab() {
	
	if (!app['json']) {		
		Ti.API.info("app['json'] VUOTO; return -1 di makeTab");
		return -1;		
	}
	
		
	if (app['json'].reparti.length == 0) {
		
		Ti.API.info("Reparti.length == 0");				
		//alert("Nessun controllo da effettuare.");
		
		var k = Ti.UI.createTableViewRow({
			title: "Nessun controllo da effettuare."
		});
		$.elenco.setData([k]);
	}
	else {						
		var arraySez = [];
		
		/**
		 * Per ogni reparto crea una TableViewSection in cui inserire
		 * le righe dei dipendenti.
		 */
		for (rep=0; rep < app['json'].reparti.length; rep++) {
						
			var sez = Titanium.UI.createTableViewSection({
				headerTitle: (app['json'].reparti[rep].nome),
				});
			
			sez.setHeaderView({
				font: {
					fontSize: 16
				}
			});
			
			var dipendenti = [];
			/**
			 * Aggiunta dei dipendenti alla sezione corrente.
			 */
			for (dip=0; dip <app['json'].reparti[rep].dipendenti.length; dip++) {
				
				if (app['json'].reparti[rep].dipendenti[dip].fatto == 'F') {
					var d = Ti.UI.createTableViewRow({
						title: (
								app['json'].reparti[rep].dipendenti[dip].n_matr +' - '+
								app['json'].reparti[rep].dipendenti[dip].cognome
							),
						color: 'black',
						font: {
							fontSize: 20,
							fontFamily: 'Helvetica Neue'
						},
						backgroundColor: 'white',
						hasChild: true
						});
					
					/**
					 * Al click si apre la finestra di 'dettaglio', con i controlli per il dipendente.
					 */
					d.addEventListener('click',function(e){				
						
						console.log("Row data: "+e.row.title.match(/\d+/g).map(Number));
						/*
						 * Ricerca dell'elemento corrispondente alla riga cliccata, e attribuzione del valore 
						 * ad una variabile. 
						 */
						
						for (i=0; i<app['json'].reparti.length; i++){
							var fatto = false;
							for (j=0; j<app['json'].reparti[i].dipendenti.length; j++){
								app['persona'] = app['json'].reparti[i].dipendenti[j];
																
								if (app['persona'].n_matr == e.row.title.match(/\d+/g).map(Number)) {
									fatto = true;
									break;
								}
							}
						}
						
						
						/** 
						 * Creazione di un'istanza di'detail'.
						 * Passo la variabile globale 'app'.
						 */
						dettaglio = Alloy.createController('detail', app);
						
						dettaglio = dettaglio.getView();
						
						dettaglio.addEventListener('close', function(){
							
							Ti.API.info("Persona.fatto: "+app['persona'].fatto);
							if(app['persona'].fatto == 'T'){
								//console.log("Eliminazione riga "+e.index);
								//console.log("Sezione - "+sez.indice);
																
								/**
								 * AGGIORNAMENTO STATO
								 * Controllo "fatto" per ogni dip. di ogni sezione.
								 * Se la i-esima sezione è fatta la tolgo e metto "T" al suo "fatto".
								 * Se tutte le sezioni sono complete, visualizzo una alert e/o invio
								 * gli esiti al server.
								 * 
								 */
								
								xhr_fatto = Ti.Network.createHTTPClient({
									timeout: 3000,
									onerror: function(){
										alert("Errore trasmissione dati");
									}									
								});
								
								xhr_fatto.open(
									"GET",
									app['urlBase'].concat("checks/dipendente/").concat(app['persona'].n_matr)
									);
								
								//xhr_fatto.send();
								$.elenco.deleteRow(e.index);
								
								
								controlloSez();
								controlloTab();								
							}														
						});						
						dettaglio.open();
						
					});
					sez.add(d);
					}
			}
			arraySez.push(sez);
			
			} // ----> Fine ciclo for -- REP		
		
		$.elenco.setData(arraySez);
		
		//Creazione messaggio INFO
		creaInfo();		
	}

	app['primaGet'] = false;
	return 0;
}

function salvaCod(e){
	//Ti.API.info('Nuovo codice: ' + e.text);
    app['cod_op'] = e.text;
    app['primaGet'] = true;
    getData(app['primaGet']);
    
}

function primaDialog(e) {
	if (app['isAndroid']) {
		app['cod_op']= $.start_input.value;
		Ti.API.info("app['cod_op']: "+$.start_input.value);
	}
	else {
		app['cod_op'] = e.text;	
	}
	
	getData();
	wait(500);
	getData();
	
	makeTab();	
}
/*
 * ----------------------------------------------------------------------fine DICHIARAZIONE FUNZIONI
 */




/*
 * +++++++++++++++++++++++++++++++++++++++++++ inizio OPERAZIONI EFFETTIVE 
 */

$.sett0.addEventListener('click',function(){
	
	if (app['isAndroid']) $.input.setWidth("20%");
	if (app['isAndroid']) $.input.setValue(app['cod_op']);
	
	cambiaCod(0, "Modifica codice operatore",
			("Attuale: "+app['cod_op'])
	);
});	


$.sett1.addEventListener('click', function(){
	
	if (app['isAndroid']) $.input.setWidth("20%");
	if (app['isAndroid']) $.input.setValue(app['minuti']);
	
	cambiaCod(
		1,
		("Attuale: "+app['minuti'] + "min"),
		(
		"Valore che indica quanto prima si vuole ricevere la notifica, rispetto all'orario di inizio del giro."+'\n'+'\n'+
		"ATTENZIONE: gli allarmi gia' impostati non verranno modificati.")
	);
});

$.sett2.addEventListener('click', function(){

	if (app['isAndroid']) $.input.setWidth("80%");
	if (app['isAndroid']) $.input.setValue(app['urlBase']);

	cambiaCod(
		2,
		("Attuale: "+app['urlBase']),
		("Inserire indirizzo base del database:")
	);
});


function aggiornamento(){	
	getData();
	wait(1000);
	refresh();
}

$.mainWindow.addEventListener('open', function() {
	$.dialog0.show();
});


//---------------------------------------------inizio OPERAZIONI EFFETTIVE


//initNotifiche();




showDialog();

$.index.open();
/*
 * +++++++++++++++++++++++++++++++++++++++++++ fine OPERAZIONI EFFETTIVE
 */
