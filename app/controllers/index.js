/**
 * Variabile globale.
 */
var app = {};
var isAndroid = (Ti.Platform.osname=='android') ? true : false;

/**
 * Quanti minuti prima dell'orario di inizio del giro si vuole mandare la notifica.
 */

app['minuti'] = 30;
app["urlBase"] = "http://127.0.0.1:8000/";

/*
 * Forse può servire.
 */
app.modificheNonSalvate = false;
app.primaGet = true;

app['urlRicezione'] = app['urlBase'] + "checks/";
app['urlInvio'] = app['urlBase'] + "checks/segnalazione/";

app['urlDaydone'] = app['urlBase'] + "checks/planning/daydone/";



/*
 * ----------------------------------------------------------------------inizio DICHIARAZIONE FUNZIONI
 */
/**
 * Riproduce un suono.
 */
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

function setRefreshVisible(){
	if (app.primaGet == true)
		$.refresh_tab.setVisible(true);
	else
		$.refresh_tab.setVisible(false);
}

function cambiaTitolo(stringa){
	$.mainWindow.setTitle(stringa);
}
function initNotifiche(){
	if (isAndroid) {
		console.log("OS: Android");
	}
	else {
		console.log("OS: iOS");

		Ti.App.iOS.registerUserNotificationSettings({
		    types: [
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
	        ]
	    });
	}
	console.log(">> Init notifiche");
}

function suona(){
	var d = Ti.App.iOS.scheduleLocalNotification({
		alertAction: "update",
		alertBody: ("Ciao ciao!"),
		badge: 0,
		date: new Date(new Date().getTime()+3000),		
		sound: "/alarm.mp3"
	});
	d.addEventListener('click', function(){
		$.refresh_tab.setVisible(true);
	});
}

function notifica(D,M,Y,hh,mm){
	
	//Se D/M/Y deve ancora arrivare creo l'allarme.
	if (new Date(Y,M,D).getDate() >= new Date().getDate()){
			
		var n = Ti.App.iOS.scheduleLocalNotification({
			alertAction: "update",
			alertBody: ("Inizio giro controlli tra "+app['minuti']+" minuti!"),
			date: new Date(new Date(Y,M,D,hh,mm).getTime()-1000*60*app['minuti']),		
			sound: "/alarm.mp3"
		});
		n.addEventListener('click', function(){
			$.refresh_tab.setVisible(true);
		});
		console.log("Alarm set: "+String(new Date(new Date(Y,M,D,hh,mm).getTime()-1000*60*app['minuti'])));
	}
	else {
		console.log("Il giorno è già passato");
	}
}

function registraNotifiche(){
	
	Titanium.UI.iOS.appBadge = 0;
	//Se è un iOS
	if (Ti.Platform.name == "iPhone OS"){
		for (r=0; r<app.json.reparti.length; r++){
			
			//Notifica lun
			notifica(
				Number(app.json.reparti[r].data_inizio.giorno),
				Number(app.json.reparti[r].data_inizio.mese)-1,
				Number(app.json.reparti[r].data_inizio.anno),
				Number(app.json.reparti[r].orario.lun.orario.substring(0,2)),
				Number(app.json.reparti[r].orario.lun.orario.substring(3,5))
				);
			
			//Notifica mar
			notifica(
				(Number(app.json.reparti[r].data_inizio.giorno)+1),
				Number(app.json.reparti[r].data_inizio.mese)-1,
				Number(app.json.reparti[r].data_inizio.anno),
				Number(app.json.reparti[r].orario.mar.orario.substring(0,2)),
				Number(app.json.reparti[r].orario.mar.orario.substring(3,5))
				);
				
			//Mer
			notifica(
				(Number(app.json.reparti[r].data_inizio.giorno)+2),
				Number(app.json.reparti[r].data_inizio.mese)-1,
				Number(app.json.reparti[r].data_inizio.anno),
				Number(app.json.reparti[r].orario.mer.orario.substring(0,2)),
				Number(app.json.reparti[r].orario.mer.orario.substring(3,5))
				);
				
			//Gio
			notifica(
				(Number(app.json.reparti[r].data_inizio.giorno)+3),
				Number(app.json.reparti[r].data_inizio.mese)-1,
				Number(app.json.reparti[r].data_inizio.anno),
				Number(app.json.reparti[r].orario.gio.orario.substring(0,2)),
				Number(app.json.reparti[r].orario.gio.orario.substring(3,5))
				);
			
			//Ven
			notifica(
				(Number(app.json.reparti[r].data_inizio.giorno)+4),
				Number(app.json.reparti[r].data_inizio.mese)-1,
				Number(app.json.reparti[r].data_inizio.anno),
				Number(app.json.reparti[r].orario.ven.orario.substring(0,2)),
				Number(app.json.reparti[r].orario.ven.orario.substring(3,5))
				);
		
		}
		
		
		console.log(">> Impostazione allarmi");
		alert("Allarmi impostati.");
	}
	else{
		/*		
		var alarmModule = require('bencoding.alarmmanager');
		var alarmManager = alarmModule.createAlarmManager();
		*/
	}
	
	// ***** ANDROID
}



function cambiaCod(indexImpostazione, titolo, messaggio){
	var dSetting0 = Ti.UI.createAlertDialog({
		title: titolo,
		message: messaggio,
		style: Titanium.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT,
		buttonNames: ['Annulla','Salva']
	});
	
	dSetting0.addEventListener('click', function(e){
		if (e.index == 0){
			console.log("Annullamento");
		}
		else {
			if(indexImpostazione == 0) {
				app.cod_op = e.text;
				app.primaGet=true;
				
				setRefreshVisible();
				
				app.json = null;
				$.elenco.setData(null);
				
				getData(primo = true);
				cambiaTitolo('');
			}
			if (indexImpostazione == 1){
				if (isNaN(e.text)==false){
					app['minuti'] = Number(e.text);
				}
				else{
					//console.log("Inserire un valore numerico!");
					alert("Inserire un valore numerico!");
					return;
				}
					
			}
			if (indexImpostazione == 2){
				app["urlBase"] = e.text;
				app.primaGet = true;
				
				setRefreshVisible();
				
				app.json = null;
				$.elenco.setData(null);
				
				getData(primo = true);
				cambiaTitolo("");
			}
			//alert("Modifica effettuata. Nuovo valore: "+e.text);
			
	}	
	});
	
	dSetting0.show();
  
}


/**
 * Ottiene semplicemente il json. Per aggiornare le tabelle o visualizzare
 * dialog informative, si devono creare all'esterno della funzione.
 */
function getData(primo) {

	
	var xhr = Ti.Network.createHTTPClient({
		timeout : 3000,
		onload : function() {
			console.log("Chiamata funzione ONLOAD di xhr.");
			if (this.getStatus() == 404)
				alert("Errore 404 - Il n_matr inserito non è valido.");
			else if (this.getStatus() == 200)
				app.json = JSON.parse(this.responseText);
			else
				alert("Il server non è disponibile.");
		},
		onerror: function(){
			console.log("Httpclient --> Error Code: "+this.getStatus());
			if ((primo == true || app.primaGet==false) && this.getStatus() == 404)
				alert("Errore 404 - Il n_matr inserito non è valido.");
				
			else if (this.getStatus() == 200)
				app.json = JSON.parse(this.responseText);
			else if (this.getStatus() == 301)
				console.log("Error cod. 301");
			else if (this.getStatus() == 300)
				console.log("Error cod. 300");
			else
				alert("Il server non è disponibile.");
				
			return this.getStatus();
		}
		/*,
		onreadystatechange: function(e) {
			
	        switch(this.readyState) {
	            case 0:
	                // after HTTPClient declared, prior to open()
	                // though Ti won't actually report on this readyState
	                Ti.API.info('case 0, readyState = ' + this.readyState);
	            break;
	            case 1:
	                // open() has been called, now is the time to set headers
	                Ti.API.info('case 1, readyState = ' + this.readyState);
	            break;
	            case 2:
	                // headers received, xhr.status should be available now
	                Ti.API.info('case 2, readyState = ' + this.readyState);
	            break;
	            case 3:
	                // data is being received, onsendstream/ondatastream being called now
	                Ti.API.info('case 3, readyState = ' + this.readyState);
	            break;
	            case 4:
	                // done, onload or onerror should be called now
	                Ti.API.info('case 4, readyState = ' + this.readyState);
	            break;
	        }
	    }
	    */	
	});
	
	url_target = app['urlRicezione'].concat(app.cod_op);
	xhr.open("GET", url_target);
	wait(1000);
	xhr.send();
	
	
	
	try{
		
		console.log("GetData -> return true");
		return 0;
	}
	catch(err){
		
		console.log("GetData -> return false");
		console.log("Error: "+String(err));
		return -1;
	}
	
}

/**
 * Visualizza tramite una Dialog il messaggio costruito
 * da creaInfo().
 */
function showInfo() {
	var dialog = Ti.UI.createAlertDialog({
    message: app.messaggio,
    title: 'Informazioni'
  });
  dialog.show();
	//console.log("SHOW INFO");
}

function salvataggio(){
	Ti.UI.createAlertDialog({
			title : "Impostazioni salvate.",
			buttonNames : ['OK']
		}).show();
}



function showDialog() {
    $.dialog.show();
}


function invioDaydone(mess){
	
	var client = Ti.Network.createHTTPClient();
	
	client.open(
		"POST",
		app['urlDaydone'],
		true
		);
	client.setRequestHeader(
		'Content-Type',
		'application/json; charset=UTF-8'
		);
		
	client.send(mess);
	
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
	
	console.log("PrimaGet --> "+app.primaGet);
	getData(app.primaGet);
	
	if (makeTab(app.primaGet) >= 0) {
		cambiaTitolo(app.json.nome+' '+app.json.cognome);
			
		if (!app.json.reparti.length == 0){
			
			registraNotifiche();
		}
		
	}
	else {
		cambiaTitolo('');

	}
	app.primaGet = false;
	setRefreshVisible();
}

/**
 * Controlla tutte le sezioni:
 * se per la i-esima sezione i dipendenti sono fatti, mette sez-fatto ='T'.
 */
function controlloSez(){
	
	for (i=0; i<app.json.reparti.length; i++) {
		if (app.json.reparti[i].fatto =='F'){
			var contatDip = 0;
			for (m=0; m<app.json.reparti[i].dipendenti.length; m++){
				if (app.json.reparti[i].dipendenti[m].fatto == 'T') {
					contatDip++;
					console.log("Dipendenti fatti: "+contatDip);
				}
			}
			if (contatDip == app.json.reparti[i].dipendenti.length) {
				app.json.reparti[i].fatto = 'T';
				console.log("Reparto "+app.json.reparti[i].nome+" finito!");
				
				//Mando una richiesta all'url indicato per far segnare come fatta una giornata per un reparto.
				var urlFineReparto = (
					app['urlBase'] + "checks/"+
					app.json.n_matr + "/planning/"+
					app.json.reparti[i].id+"/done/"
					);
				var client = Ti.Network.createHTTPClient();
				client.open("GET",urlFineReparto, true);
				client.send();
			}
		}
	}
}


function controlloTab(){
	var contatore = 0;
	for (i=0; i<app.json.reparti.length; i++){
		if (app.json.reparti[i].fatto == 'T')
			contatore++;
	}
	if (contatore == app.json.reparti.length){
		alert("Giro giornaliero finito!");
		console.log("Giro finito!");
	
		/*	
		//Creazione json
		var messaggio ='{"reparti":[';
		
		
		for (q=0; q<app.json.reparti.length; q++){
			if (app.json.reparti[q].fatto == 'T') {
				messaggio += '{"id_settimana":"'+app.json.reparti[q].id+'"}';
				if (q< app.json.reparti.length -1)
					messaggio +=',';
			}
		}
		messaggio += "]}";
		console.log("Messaggio:");
		console.log(messaggio);
		
		invioDaydone(messaggio);
		//Invio json
		*/
	}
}

/**
 * Accede al json salvato e costruisce il messaggio informativo
 * costituito dall'orario dei giri-controlli, per ogni reparto
 * coinvolto.
 */
function creaInfo() {
	app.messaggio= "";
	for (r=0; r<app.json.reparti.length; r++){
		app.messaggio += 'REPARTO: '+app.json.reparti[r].nome+'\n';
		
		if (app.json.reparti[r].orario.lun.festivo == 'T')
			app.messaggio += 'lun: CHIUSURA'+'\n';
		else
			app.messaggio += 'lun: '+app.json.reparti[r].orario.lun.orario+'\n';
		
		if (app.json.reparti[r].orario.mar.festivo == 'T')
			app.messaggio += 'mar: CHIUSURA'+'\n';
		else
			app.messaggio += 'mar: '+app.json.reparti[r].orario.mar.orario+'\n';
		
		if (app.json.reparti[r].orario.mer.festivo == 'T')
			app.messaggio += 'mer: CHIUSURA'+'\n';
		else
			app.messaggio += 'mer: '+app.json.reparti[r].orario.mer.orario+'\n';
		
		if (app.json.reparti[r].orario.gio.festivo == 'T')
			app.messaggio += 'gio: CHIUSURA'+'\n';
		else
			app.messaggio += 'gio: '+app.json.reparti[r].orario.gio.orario+'\n';
		
		if (app.json.reparti[r].orario.ven.festivo == 'T')
			app.messaggio += 'ven: CHIUSURA'+'\n';
		else
			app.messaggio += 'ven: '+app.json.reparti[r].orario.ven.orario+'\n';
		
		app.messaggio +='\n';
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
 * Scandisce il json (variabile app.json) e costruisce la tabella,
 * dotata di opportune sezioni.
 */
function makeTab(primo) {
	
	if (!app.json) {
		
		
		console.log("!app.json");
		
		console.log("MakeTab -> return false");
		return -1;
		
	}
	
		
	if (app.json.reparti.length == 0) {
		
		console.log("Reparti.length == 0");
		console.log("MakeTab -> return false");
		
		//alert("Nessun controllo da effettuare.");
		
		var k = Ti.UI.createTableViewRow({
			title: "Nessun controllo da effettuare."
		});
		$.elenco.setData([k]);
	}
	else {
		
		/*
		 * Se oggi è festivo ritorno false.
		 */
		var d = new Date();
	    var n = d.getDay();
	    
	    console.log("N: "+n);
	    switch(n){
	    	case 1:
	    		if (app.json.reparti[0].orario.lun.festivo=='T'){
	    			messaggioChiusura();
	    			return 1;
	    		}
	    		break;
	    	case 2:
	    		if (app.json.reparti[0].orario.mar.festivo=='T'){
	    			messaggioChiusura();
	    			return 1;
	    		}
	    		break;
	    	case 3:
	    	
	    		if (app.json.reparti[0].orario.mer.festivo=='T'){
	    			messaggioChiusura();
	    			console.log("---> OGGI <---");		
	    			return 1;
	    		}
	    		break;
	    	case 4:
	    		if (app.json.reparti[0].orario.gio.festivo=='T'){
	    			messaggioChiusura();
	    			console.log("---> OGGI gio <---");		

	    			return 1;
	    		}
	    		break;
	    	case 5:
	    		if (app.json.reparti[0].orario.ven.festivo=='T'){
	    			messaggioChiusura();
	    			return 1;
	    		}
	    		break;
	    }
		
		var arraySez = [];
		// ----> Inizio for REP
		for (rep=0; rep < app.json.reparti.length; rep++) {
			
			
			var sez = Titanium.UI.createTableViewSection({
				headerTitle: (app.json.reparti[rep].nome),
				
				});
			
			
			var dipendenti = [];
			for (dip=0; dip <app.json.reparti[rep].dipendenti.length; dip++) {
				if (app.json.reparti[rep].dipendenti[dip].fatto == 'F') {
					var d = Ti.UI.createTableViewRow({
						title: (
							app.json.reparti[rep].dipendenti[dip].n_matr +' - '+
							app.json.reparti[rep].dipendenti[dip].cognome),
						height:40,
						n_matr: String(app.json.reparti[rep].dipendenti[dip].n_matr),
						hasChild: true
						});
					
					//Creazione di una istanza di detail e apertura.
					d.addEventListener('click',function(e){				
						
						//Devo passare l'elemento cliccato (json)
						//Ricerca nel json e passaggio elemento
						var persona;
						for (i=0; i<app.json.reparti.length; i++){
							var fatto = false;
							for (j=0; j<app.json.reparti[i].dipendenti.length; j++){
								persona = app.json.reparti[i].dipendenti[j];
								
								if (persona.n_matr == e.rowData.n_matr) {
									fatto = true;
									break;
									}
							}
							if (fatto){
								console.log("N_matr. riga cliccata: "+persona.n_matr);
								break;
								}
						}
						
						
						/* Passo l'elemento dipendente del json al controller,
						 * in modo da poterne visualizzare i dati.
						 */
						dettaglio = Alloy.createController('detail', persona);
						
						dettaglio = dettaglio.getView();
						
						dettaglio.addEventListener('close', function(){
							
							console.log("Persona.fatto: "+persona.fatto);
							if(persona.fatto == 'T'){
								console.log("Eliminazione riga "+e.index);
								console.log("Sezione - "+sez.indice);
								
								//Aggiornamento stato
								/*
								 * Controllo "fatto" per ogni dip. di ogni sezione.
								 * Se la i-esima sezione è fatta la tolgo e metto "T" al suo "fatto".
								 * Se tutte le sezioni sono complete, visualizzo una alert e invio qualcosa al server.
								 * 
								 */
								
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
		
		console.log("MakeTab -> return true");
	}

	app.primaGet = false;
	return 0;
}

function salvaCod(e){
	Ti.API.info('Nuovo codice: ' + e.text);
    app.cod_op = e.text;
    app.primaGet = true;
    getData(app.primaGet);
    
}


function clickDialog(e) {
    Ti.API.info('Input da dialog iniziale: ' + e.text);
    
    
	    app.cod_op = e.text;
	    
	    
	    if(getData(primo = true) == 0) {
	    	
	    	
	    	makeTab(primo = true);
	    	
	    }
	
}
/*
 * ----------------------------------------------------------------------fine DICHIARAZIONE FUNZIONI
 */




/*
 * +++++++++++++++++++++++++++++++++++++++++++ inizio OPERAZIONI EFFETTIVE 
 */

$.sett0.addEventListener('click',function(){
	cambiaCod(0, "Modifica codice operatore",
		("Attuale: "+app.cod_op));
	});

$.sett1.addEventListener('click', function(){
	cambiaCod(
		1,
		("Attuale: "+app['minuti'] + "min"),
		(
		"Valore che indica quanto prima si vuole ricevere la notifica, rispetto all'orario di inizio del giro."+'\n'+'\n'+
		"ATTENZIONE: gli allarmi gia' impostati non verranno modificati.")
	);
});

$.sett2.addEventListener('click', function(){
	cambiaCod(
		2,
		("Attuale: "+app['minuti'] + "min"),
		("Inserire indirizzo base del database. (Attuale: "+app["urlBase"]+")")
	);
});


//initNotifiche();
showDialog();
$.index.open();

/*
 * +++++++++++++++++++++++++++++++++++++++++++ fine OPERAZIONI EFFETTIVE
 */
