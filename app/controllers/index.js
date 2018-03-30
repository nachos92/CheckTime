/**
 * Variabile globale e valori iniziali.
 */
var app = {};

/**
 * Se è true, viene mostrato il numero matricola dei dipendenti (di fianco al nome, nella lista).
 * Inoltre vengono mostrati i pulsanti di prova.
 */
app['DEBUG'] = true;
app['password'] = "0000";

app['noScan'] = true;
app['invioSegnalazione'] = false;

app['timezoneOffset'] = 60;
app['minuti'] = 30;
app['messaggio'] = '';

app['isAndroid'] = (Ti.Platform.osname=='android') ? true : false;

app['primaGet'] = true;
 
app['urlRicezione'] = app['urlBase'] + "checks/";
app['urlInvio'] = app['urlBase'] + "checks/dipendente/";
app['urlDaydone'] = app['urlBase'] + "checks/planning/daydone/";



/*
 * ----------------------------------------------------------------------inizio DICHIARAZIONE FUNZIONI
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
	if (app['isAndroid']){
		$.titolo.setFont({
			fontSize: 30,
			fontFamily: 'Helvetica Neue'
		});

		$.titolo.setText(stringa);
	}
	else {
		$.mainWindow.setTitle(stringa);
	}
	
	
}

function provanotifica(){
	if (app['isAndroid']){
			
		// Create an intent using the JavaScript service file
		var intent = Ti.Android.createServiceIntent({
		    url : 'serviceNotifiche.js'
		});
		 
		// Set the interval to run the service; set to five seconds in this example
		intent.putExtra('interval', 1000);
		 
		// Send extra data to the service; send the notification 30 seconds from now in this example
		intent.putExtra('timestamp', new Date(new Date().getTime() + 5 * 1000));
		
		intent.putExtra('minuti', String(app['minuti']));
		 
		intent.putExtra('title', "Attenzione!");
		intent.putExtra('message', "Questa è una notifica di prova.");
		
 
		
		// Start the service
		Ti.Android.startService(intent);

	}
	else {
		var d = Ti.App.iOS.scheduleLocalNotification({
			alertAction: "update",
			alertBody: ("Ciao ciao!"),
			badge: 0,
			date: new Date(new Date().getTime()+5000),		
			sound: "/alarm.mp3"
		});	
		d.addEventListener('click', function(){
			$.refresh_tab.setVisible(true);
		});
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
    	intent.putExtra('message' , ("Inizio giro controlli tra "+String(app['minuti'])+" min."));
    	intent.putExtra('interval', 3000);
    	
    	timestamp = new Date(data-app['minuti']*60*1000);
    	
    	if (timestamp < new Date()){
    		//Settimana dopo
    		intent.putExtra('timestamp', new Date(timestamp.getTime() + 1000*60*60*24*7));
    		Ti.API.info("Notifica impostata in data: "+String( new Date(timestamp.getTime() + 1000*60*60*24*7)));
    	}
    	else {
    		intent.putExtra('timestamp', timestamp);
    		Ti.API.info("Notifica impostata in data: "+ String(timestamp));

    	}
    	
   		
   		/*
   		 * Se la data è superata, imposto la notifica per lo stesso giorno però
   		 * nella settimana successiva.
   		 */
   		
   		
   		
   		
   		
   		
    	Ti.Android.startService(intent);
		   	
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
		Ti.API.info("Allarme impostato:"+'\t'+new Date(data-app['minuti']*60*1000));
	}		
			
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
		
	//Azzeramento delle notifiche preesistenti.
	if(app['isAndroid']) {
		Titanium.Android.NotificationManager.cancelAll();
	}
	else {
		Titanium.App.iOS.cancelAllLocalNotifications();
		if (parseInt(Ti.Platform.version.split(".")[0]) >= 8){
		
		Ti.App.iOS.registerUserNotificationSettings({
		    types: [
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
	        ]
	    });
		}
	}
	
	for (var r=0; r<app['json'].reparti.length; r++){
			var inizio = new Date(app['json'].reparti[0].data_inizio);
			if(app['json'].reparti[0].orario.lun.orario)		
				notifica(
					(inizio.getDate()+0),
					(inizio.getMonth()),
					(inizio.getFullYear()),
					(app['json'].reparti[r].orario.lun.orario.substring(0,2)),
					(app['json'].reparti[r].orario.lun.orario.substring(3,5))
				);
			
			if(app['json'].reparti[0].orario.mar.orario)		
				notifica(
					(inizio.getDate()+1),
					(inizio.getMonth()),
					(inizio.getFullYear()),
					(app['json'].reparti[r].orario.mar.orario.substring(0,2)),
					(app['json'].reparti[r].orario.mar.orario.substring(3,5))
				);
			
			if(app['json'].reparti[0].orario.mer.orario)			
				notifica(
					(inizio.getDate()+2),
					(inizio.getMonth()),
					(inizio.getFullYear()),
					(app['json'].reparti[r].orario.mer.orario.substring(0,2)),
					(app['json'].reparti[r].orario.mer.orario.substring(3,5))
				);
			
			if(app['json'].reparti[0].orario.gio.orario)		
				notifica(
					(inizio.getDate()+3),
					(inizio.getMonth()),
					(inizio.getFullYear()),
					(app['json'].reparti[r].orario.gio.orario.substring(0,2)),
					(app['json'].reparti[r].orario.gio.orario.substring(3,5))
				);
			
			if(app['json'].reparti[0].orario.ven.orario)		
				notifica(
					(inizio.getDate()+4),
					(inizio.getMonth()),
					(inizio.getFullYear()),
					(app['json'].reparti[r].orario.ven.orario.substring(0,2)),
					(app['json'].reparti[r].orario.ven.orario.substring(3,5))
				);
				
			if(app['json'].reparti[0].orario.sab.orario)		
				notifica(
					(inizio.getDate()+5),
					(inizio.getMonth()),
					(inizio.getFullYear()),
					(app['json'].reparti[r].orario.sab.orario.substring(0,2)),
					(app['json'].reparti[r].orario.sab.orario.substring(3,5))
				);
				
			if(app['json'].reparti[0].orario.dom.orario)		
				notifica(
					(inizio.getDate()+6),
					(inizio.getMonth()),
					(inizio.getFullYear()),
					(app['json'].reparti[r].orario.dom.orario.substring(0,2)),
					(app['json'].reparti[r].orario.dom.orario.substring(3,5))
				);			
		}			
}

/**
 * Ottiene semplicemente il json. Per aggiornare le tabelle o visualizzare
 * dialog informative, si devono creare all'esterno della funzione.
 */
function getData() {
	var xhr = Ti.Network.createHTTPClient({
		timeout : 3000,		
		onload : function() {
			Ti.API.info("Chiamata funzione ONLOAD di xhr.");
			
			if (this.getStatus() == 200) {
				Ti.API.info("Parsing json...");
				app['json'] = JSON.parse(this.responseText);

			}
			app['httpErr'] = false;
		},
		onerror: function(){
			
			if (this.getStatus() == 301){
				
				Ti.UI.createAlertDialog({
					title:"Errore 301"
				}).show();
				app['primaGet'] = false;	
			}
			else {
				alert("Errore: HTTP Error "+this.getStatus());
				app['httpErr'] = true;
				//console.log("app['httpErr']: "+app['httpErr']);
			}	
		}
	});

	//console.log(app['urlRicezione'].concat(app['cod_op']));
	xhr.open("GET", app['urlRicezione'].concat(app['cod_op']));
	
	try{					
		xhr.send();
		return 0;	
	}
	catch(err){
		Ti.API.info("GetData Error: "+err);
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
  $.dialogInfo.setTitle('ORARI');
  $.dialogInfo.setMessage(app['messaggio']);
  $.dialogInfo.show();
  //dialog.show();	
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
function refresh() {
		
	Ti.API.info("PrimaGet --> "+app['primaGet']);
	//console.log(getData(app['primaGet']));
	//console.log(app['json']);
	
	if (makeTab() >= 0) {
		
		cambiaTitolo(app['json'].nome+' '+app['json'].cognome);
		if (app['isAndroid']) $.titolo.setVisible(true);
			
		if (!app['json'].reparti.length == 0){
			
			registraNotifiche();
		}
		
	}
	else {
		cambiaTitolo('');
		if (app['isAndroid'])$.titolo.setVisible(false);

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
		
		
		app['messaggio'] += (app['json'].reparti[r].orario.lun.orario) ?
			'lun:   '+app['json'].reparti[r].orario.lun.orario+'\n' : '';
			
		app['messaggio'] += (app['json'].reparti[r].orario.mar.orario) ?
			'mar:   '+app['json'].reparti[r].orario.mar.orario+'\n' : '';				
		
		app['messaggio'] += (app['json'].reparti[r].orario.mer.orario) ?
			'mer:   '+app['json'].reparti[r].orario.mer.orario+'\n' : '';
	
		app['messaggio'] += (app['json'].reparti[r].orario.gio.orario) ?
			'gio:   '+app['json'].reparti[r].orario.gio.orario+'\n' : '';
	
		app['messaggio'] += (app['json'].reparti[r].orario.ven.orario) ?
			'ven:   '+app['json'].reparti[r].orario.ven.orario+'\n' : '';
			
		app['messaggio'] += (app['json'].reparti[r].orario.sab.orario) ?
			'sab:   '+app['json'].reparti[r].orario.sab.orario+'\n' : '';
			
		app['messaggio'] += (app['json'].reparti[r].orario.dom.orario) ?
			'dom:   '+app['json'].reparti[r].orario.dom.orario+'\n' : '';
		
		app['messaggio'] +='\n';
	}
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
					
					var titolo = (app['json'].reparti[rep].dipendenti[dip].cognome +' '+
								app['json'].reparti[rep].dipendenti[dip].nome);
					
					if (app['DEBUG']) titolo += ' ('+
								app['json'].reparti[rep].dipendenti[dip].n_matr +')';
					
					var d = Ti.UI.createTableViewRow({
						title: titolo,
						color: 'black',
						font: {
							fontSize: 20,
							fontFamily: 'Helvetica Neue'
						},
						backgroundColor: 'white',
						hasChild: true,
						n_matr: app['json'].reparti[rep].dipendenti[dip].n_matr

						});
					
					/**
					 * Al click si apre la finestra di 'dettaglio', con i controlli per il dipendente.
					 */
					d.addEventListener('click',function(e){				
						
						app['n_matr'] = e.row.title.n_matr;
						
						/*
						 * Ricerca dell'elemento corrispondente alla riga cliccata, e attribuzione del valore 
						 * ad una variabile. 
						 */						
						for (i=0; i<app['json'].reparti.length; i++){
							var fatto = false;
							for (j=0; j<app['json'].reparti[i].dipendenti.length; j++){
								app['matricola'] = app['json'].reparti[i].dipendenti[j];
																
								if (app['matricola'].n_matr == e.row.title.n_matr) {
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
							
							Ti.API.info("Persona.fatto: "+app['matricola'].fatto);
							if(app['matricola'].fatto == 'T'){
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
									app['urlBase'].concat("checks/dipendente/").concat(app['matricola'].n_matr)
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
	if (app['httpErr']) getData();
	
	makeTab();	
}

function aggiornamento(){	
	getData();
	wait(1000);
	refresh();
}

function init() {
	if (app['DEBUG']) app["urlBase"] = (app['isAndroid']) ? "http://10.0.2.2:8000/" : "http://127.0.0.1:8000/";
	else app['urlBase'] = "http://192.168.0.101:8080/";
	if (app['DEBUG']==false) $.provanotifiche.setVisible(false);
	else $.provanotifiche.setVisible(true);

}


/*
 * ----------------------------------------------------------------------fine DICHIARAZIONE FUNZIONI
 */




/*
 * +++++++++++++++++++++++++++++++++++++++++++ inizio OPERAZIONI EFFETTIVE 
 */

//Cod. operatore
$.sett0.addEventListener('click',function(){
	
	if (app['isAndroid']) {
		$.input.setWidth("20%");
		$.input.setValue(app['cod_op']);		
	}
	else {
		$.d_sett0.setStyle(Titanium.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);		
		$.d_sett0.setValue(app['cod_op']);		
	}
	
	$.d_sett0.setTitle("Modifica codice operatore");
	$.d_sett0.setMessage("Attuale: "+app['cod_op']);
	
	
	
	if(app['isAndroid']){
		$.input.setSelection(0,String($.input.value).length);		
	}
	else {
		$.d_sett0.setStyle(Titanium.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);
	}
	
	
	$.d_sett0.show();
  
});
//Cod. operatore
$.d_sett0.addEventListener('click', function(e){	
		if (e.index == 0){
			Ti.API.info("Annullamento");
		}
		else {
				if (app['isAndroid']){
					if ($.input.value != '') {
						console.log($.input.value);
						app['cod_op'] = $.input.value;
						
					}	
				}
				else {
					if (e.text !='')
						app['cod_op'] = e.text;
				}
					
				app['primaGet']=true;
				
				//setRefreshVisible(true);
				
				app['json'] = null;
				$.elenco.setData(null);
				
				getData();
				cambiaTitolo('');
				if (app['isAndroid']) $.titolo.setVisible(false);
		}	
	});

//Minuti
$.sett1.addEventListener('click', function(){
	
	if (app['isAndroid'])  {
		$.input1.setWidth("20%");
		$.input1.setValue(app['minuti']);
		$.input1.setSelection(0,String($.input1.value).length);
	}
	else {
		$.d_sett1.setStyle(Titanium.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);		
		$.d_sett1.setValue(app['minuti']);
	}
		
	$.d_sett1.setTitle("Modifica preavviso allarme");
	$.d_sett1.setMessage(
		("Valore che indica quanto prima si vuole ricevere la notifica, rispetto all'orario di inizio del giro."+'\n'+'\n'+
		"ATTENZIONE: gli allarmi gia' impostati non verranno modificati."));
	
	
	$.d_sett1.show();
});
//Minuti
$.d_sett1.addEventListener('click', function(e){
	if (e.index == 0){
		//console.log("ANNULLAMENTO");
	}
	else {
		if (app['isAndroid']){
		if (isNaN($.input1.value)==false)
			if ($.input1.value != '')
				app['minuti'] = Number($.input1.value);
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
});

//URL base
$.sett2.addEventListener('click', function(){

	if (app['isAndroid']) {
		$.input2.setWidth("80%");	
		$.input2.setValue(app['urlBase']);
		$.input2.setSelection(0,String($.input2.value).length);

	}
	else {
		$.d_sett2.setStyle(Titanium.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);		
		$.d_sett2.setValue(app['urlBase']);
	}
	$.d_sett2.setTitle("Modifica URL server");	
	$.d_sett2.setMessage("N.B. Deve essere scritto anteponendo 'http://'.");
	
	$.d_sett2.show();
});
$.d_sett2.addEventListener('click',function(e){
	
	if (e.index == 0){
		console.log("ANNULLAMENTO");
	}
	else {
		if (app['isAndroid']){
			if ($.input2.value != '')
				app["urlBase"] = $.input2.value;
		}
		else {
			if (e.text != '')
				app["urlBase"] = e.text;
		}
		app['primaGet'] = true;
								
		app['json'] = null;
		$.elenco.setData(null);
				
		getData();
		cambiaTitolo("");
	}
});


$.settDebug.addEventListener('click', function(){
	if (app['isAndroid']){
		
	}
	else {
		$.d_settDebug.setStyle(Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);
	}
	$.d_settDebug.show();
});
$.d_settDebug.addEventListener('click', function(e){	
	
	if (e.index == 0) {		
		if (app['isAndroid'] == false){			
			if (e.text != app['password']) {				
				return;
			}			
		}
		else {			
			if ($.input_debug.value != app['password']) {				
				return;
			}
		}		
		app['DEBUG'] = false;		
		init();
	}
	else if (e.index == 1) {
		if (app['isAndroid'] == false){
			if (e.text != app['password']) {
				return;				
			}			
		}
		else {
			if ($.input_debug.value != app['password'])
				return;
		}
		app['DEBUG'] = true;
		init();		
	}
});

$.mainWindow.addEventListener('open', function() {
	$.dialog0.show();
});



//++++++++++++++++++++++++++++++++++++++++++++ inizio OPERAZIONI EFFETTIVE


init();
showDialog();

$.index.open();

//+++++++++++++++++++++++++++++++++++++++++++ fine OPERAZIONI EFFETTIVE

