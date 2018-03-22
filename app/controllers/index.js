/**
 * Variabile globale e valori iniziali.
 */
var app = {};

app['DEBUG'] = true;

app['isAndroid'] = (Ti.Platform.osname=='android') ? true : false;

app['primaGet'] = true;

app["urlBase"] = (app['isAndroid']) ? "http://10.0.2.2:8000/" : "http://127.0.0.1:8000/";
app['urlRicezione'] = app['urlBase'] + "checks/";
app['urlInvio'] = app['urlBase'] + "checks/segnalazione/";
app['urlDaydone'] = app['urlBase'] + "checks/planning/daydone/";

app['minuti'] = 30;
app['messaggio'] = '';


var xhr = Ti.Network.createHTTPClient({
		timeout : 3000,		
		onload : function() {
			console.log("Chiamata funzione ONLOAD di xhr.");
			
			if (this.getStatus() == 200) {
				console.log("Parsing json...");
				app['json'] = JSON.parse(this.responseText);

			}
			
			//app['json'] = JSON.parse(this.responseText);
			//app['json'] = this.responseData;
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
	//data = new Date().getDate();
	data = new Date(app['json'].reparti[0].data_inizio);
	
	console.log("Data: "+data.getMonth());
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
function initNotifiche(){
	if (app['isAndroid']) {
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
	var oggi = new Date(); 
	var data = new Date(Y,M,D,hh,mm);
	
	console.log("Data: "+String(new Date(new Date(Y,M,D,hh,mm).getTime()-1000*60*app['minuti'])));
	
	if (data> oggi ){
			
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
		console.log("Il giorno è già passato: "+ data);
	}
}

function registraNotifiche(){
	
		
	if (app['isAndroid']){
		/*		
		var alarmModule = require('bencoding.alarmmanager');
		var alarmManager = alarmModule.createAlarmManager();
		*/
	}
	else {
		Titanium.UI.iOS.appBadge = 0;
		
		Titanium.App.iOS.cancelAllLocalNotifications();
		
		for (r=0; r<app['json'].reparti.length; r++){
			data = new Date(app['json'].reparti[r].data_inizio);
			//Notifica lun
			notifica(
				Number(data.getDay()),
				Number(data.getMonth()),
				Number(data.getYear()),
				Number(app['json'].reparti[r].orario.lun.orario.substring(0,2)),
				Number(app['json'].reparti[r].orario.lun.orario.substring(3,5))
			);
			
			console.log("Giorno: "+data.getDay());
			console.log("Mesi: "+data.getMonth());
			console.log("Anno: "+data.getYear());
			console.log("Ora: "+ app['json'].reparti[r].orario.lun.orario.substring(0,2));
			console.log("Minuti: "+ app['json'].reparti[r].orario.lun.orario.substring(3,5));
				
			/*
			//Notifica mar
			notifica(
				(Number(app['json'].reparti[r].data_inizio.giorno)+1),
				Number(app['json'].reparti[r].data_inizio.mese)-1,
				Number(app['json'].reparti[r].data_inizio.anno),
				Number(app['json'].reparti[r].orario.mar.orario.substring(0,2)),
				Number(app['json'].reparti[r].orario.mar.orario.substring(3,5))
				);
				
			//Mer
			notifica(
				(Number(app['json'].reparti[r].data_inizio.giorno)+2),
				Number(app['json'].reparti[r].data_inizio.mese)-1,
				Number(app['json'].reparti[r].data_inizio.anno),
				Number(app['json'].reparti[r].orario.mer.orario.substring(0,2)),
				Number(app['json'].reparti[r].orario.mer.orario.substring(3,5))
				);
				
			//Gio
			notifica(
				(Number(app['json'].reparti[r].data_inizio.giorno)+3),
				Number(app['json'].reparti[r].data_inizio.mese)-1,
				Number(app['json'].reparti[r].data_inizio.anno),
				Number(app['json'].reparti[r].orario.gio.orario.substring(0,2)),
				Number(app['json'].reparti[r].orario.gio.orario.substring(3,5))
				);
			
			//Ven
			notifica(
				(Number(app['json'].reparti[r].data_inizio.giorno)+4),
				Number(app['json'].reparti[r].data_inizio.mese)-1,
				Number(app['json'].reparti[r].data_inizio.anno),
				Number(app['json'].reparti[r].orario.ven.orario.substring(0,2)),
				Number(app['json'].reparti[r].orario.ven.orario.substring(3,5))
				);
		*/
		}
		
		
		//console.log(">> Impostazione allarmi");
		alert("Allarmi impostati.");
	}		
	// ***** ANDROID
}

function cambiaCod(indexImpostazione, titolo, messaggio){
	/*
	 var dSetting0 = Ti.UI.createAlertDialog({
		title: titolo,
		message: messaggio,
		style: Titanium.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT,
		buttonNames: ['Annulla','Salva']
	});
	*/
	//$d_sett0.setButtonNames(['Annulla','Salva']);
	$.d_sett0.setTitle(titolo);
	$.d_sett0.setMessage(messaggio);
	
	
	if(!app['isAndroid']){
		$.d_sett0.setStyle(Titanium.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);
	}
	
	$.d_sett0.addEventListener('click', function(e){
		if (e.index == 0){
			console.log("Annullamento");
		}
		else {
			if(indexImpostazione == 0) {
				if (app['isAndroid']){
					//$.input.setKeyboardType(Ti.UI.KEYBOARD_TYPE_NUMBER_PAD);
					app['cod_op'] = $.input.value;
					console.log("Valore: "+app['cod_op']);
				}
				else {
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
						app['minuti'] = Number($.input.value);
				}
				else{
					if (isNaN(e.text)==false){
						app['minuti'] = Number(e.text);
					}
					else{
						alert("Inserire un valore numerico!");
						return;
					}
				}	
			}
			if (indexImpostazione == 2){
				if (app['isAndroid'])
					app["urlBase"] = $.input.value;
				else
					app["urlBase"] = e.text;
				
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

	console.log(app['urlRicezione'].concat(app['cod_op']));
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
	/*
	d = Ti.UI.createAlertDialog(
		{
			title: "ATTENZIONE",
			//id: "dialog",
						
			cancel: 1	
		}
	);
	*/
	if(app['isAndroid']){		
		
	}
	else{
		//$.dialog0.setMessage("Inserire codice operatore:");
		$.dialog0.setPersistent(true);
		$.dialog0.setStyle(Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);		
			
	}
	//$.dialog0.show();
    //$.dialog.show();
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
		
	console.log("PrimaGet --> "+app['primaGet']);
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
				
				console.log("Reparto "+app['json'].reparti[i].nome+" finito!");
				//alert("Reparto "+app['json'].reparti[i].nome+" finito!");
				
				/*
				 * Mando una richiesta all'url indicato
				 * per segnare come fatta una giornata per un reparto.
				 */
				var urlFineReparto = (
					app['urlBase'] + "checks/"+
					app['json'].n_matr + "/planning/"+
					app['json'].reparti[i].id+"/done/"
					);
				var client = Ti.Network.createHTTPClient({
					timeout: 3000,
					onerror: function(){
						alert("Errore invio Daydone");
					}
				});
				
				client.open("GET",urlFineReparto, true);
				client.send();
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
		alert("Giro giornaliero finito!");
		console.log("Giro finito!");	
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
			app['messaggio'] += 'lun: '+app['json'].reparti[r].orario.lun.orario+'\n';
		
		if (app['json'].reparti[r].orario.mar.festivo == 'T')
			app['messaggio'] += 'mar: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'mar: '+app['json'].reparti[r].orario.mar.orario+'\n';
		
		if (app['json'].reparti[r].orario.mer.festivo == 'T')
			app['messaggio'] += 'mer: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'mer: '+app['json'].reparti[r].orario.mer.orario+'\n';
		
		if (app['json'].reparti[r].orario.gio.festivo == 'T')
			app['messaggio'] += 'gio: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'gio: '+app['json'].reparti[r].orario.gio.orario+'\n';
		
		if (app['json'].reparti[r].orario.ven.festivo == 'T')
			app['messaggio'] += 'ven: CHIUSURA'+'\n';
		else
			app['messaggio'] += 'ven: '+app['json'].reparti[r].orario.ven.orario+'\n';
		
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
		console.log("app['json'] VUOTO; return -1 di makeTab");
		return -1;		
	}
	
		
	if (app['json'].reparti.length == 0) {
		
		console.log("Reparti.length == 0");				
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
							
							console.log("Persona.fatto: "+app['persona'].fatto);
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
	Ti.API.info('Nuovo codice: ' + e.text);
    app['cod_op'] = e.text;
    app['primaGet'] = true;
    getData(app['primaGet']);
    
}

function primaDialog(e) {
	if (app['isAndroid']) {
		app['cod_op']= $.start_input.value;
		console.log("app['cod_op']: "+$.start_input.value);
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
	if (app['isAndroid']){
		cambiaCod(0, "Modifica codice operatore",
			("Attuale: "+app['cod_op']));
	}
	else{
	
		cambiaCod(0, "Modifica codice operatore",
			("Attuale: "+app['cod_op']));
		}
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
