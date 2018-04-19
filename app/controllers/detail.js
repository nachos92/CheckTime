	// Arguments passed into this controller can be accessed via the `$.args` object directly or:
	//var dip = $.args['persona'];
	
	
	
	if ($.args['noScan'] == false) {
		var scanditsdk = require('com.mirasense.scanditsdk');
	
		//scanditsdk.appKey = "";
		scanditsdk.cameraFacingPreference = 0;    // 0 = back, 1 = front
		
		var openScannerIfPermission = function() {
	    if (Ti.Media.hasCameraPermissions()) {
	        openScanner();
	    } else {
	        Ti.Media.requestCameraPermissions(function(e) {
	            if (e.success) {
	                openScanner();
	            } else {
	                alert('You denied camera permission.');
	            }
	        });
	    }
	};
}
		
	 
	//Conterrà i valori degli switch. 
	 var dizModifiche = {};
	
	 
	
	
	//Array da passare alla TableView per il riempimento.
	var arrayControlli = [];
	
	
	for (iter=0; iter<2; iter++){
		if (iter==0){
	
			for (i=0; i<$.args['dipendente'].controlli.length; i++){
				
				var c = Ti.UI.createTableViewRow({
					//title: dip.controlli[i].titolo,
					backgroundColor: "white",
					color: 'black',
					borderRadius: '1',		
					borderColor: 'black',
					height: '40',			
					width: '90%',	
					font: {
						fontSize: 20,
						fontFamily: 'Helvetica Neue'					
					}
				});				
				c.add(Ti.UI.createLabel({
					text: $.args['dipendente'].controlli[i].titolo,
					left: "2%",
					color: 'black',
					font: {
						fontSize: 18,
						fontFamily: 'Helvetica Neue'					
					}
				}));				
				
				var statoSwitch = ($.args['dipendente'].controlli[i].value == 'F') ? false : true;				
				var s = Ti.UI.createSwitch({
					value: statoSwitch,
					titolo: $.args['dipendente'].controlli[i].titolo,
					id: $.args['dipendente'].controlli[i].id,
					nome: $.args['dipendente'].controlli[i].titolo,
					right: '2%',					
				});
				
				if ($.args['isAndroid']) {
					s.setBackgroundColor('lightgray');
					s.setBorderColor('gray');
					s.setBorderRadius(5);				
				}
				
				dizModifiche[$.args['dipendente'].controlli[i].titolo] = statoSwitch;				
				
				s.addEventListener('change', function(e){					
					dizModifiche[this.titolo] = e.value;
				});
				c.add(s);			
				arrayControlli.push(c);
			}
		}
		else {
			iter++;
			$.tabDettaglio.setData(arrayControlli);
			break;
		}
	}	
	
	function closeDetail(){
		$.detail.close();
	}
	
	
	function invioSegnalazione(oggetto){
		var client = Ti.Network.createHTTPClient();
		Ti.API.info("Invio JSON a: "+$.args['urlInvio'] + $.args['dipendente'].n_matr + '/done/');
		client.open(
			"POST",
			$.args['urlInvio'] + $.args['dipendente'].n_matr + '/done/',
			true);
		client.setRequestHeader(
			'Content-Type',
			'application/json; charset=UTF-8'
			);
		Ti.API.info("JSON:");
		Ti.API.info(oggetto);
		client.send(oggetto);
	
	}
	
	
	function conferma(){
		var testo='';
		
		for (var key in dizModifiche){	
			testo += key + ':'+'\t'+'\t';
			testo += dizModifiche[key] ? "Si'" : "No"; 
			testo += '\n';
		}
		
		testo += '\n'+'\n'+"Per confermare, inserire il codice dipendente:";
		
		$.dConferma.setTitle("Riepilogo");
		$.dConferma.setMessage(testo);
	
		if ($.args['isAndroid']){
			$.inputConferma.value = "";
		}
		else {
			$.dConferma.setPersistent(true);
			$.dConferma.setStyle(Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);		

		}
		
		$.dConferma.addEventListener('click', function(e){			
			if (e.index == 0) {
				Ti.API.info("Annullamento");
			}
			else {
				if ($.args['noScan']){					
					Ti.API.info("<--- Acquisizione sospesa --> ");
					if ($.args['isAndroid']){						
						Ti.API.info("Input_conferma.value: "+$.inputConferma.value);
						if ($.inputConferma.value != $.args['dipendente'].n_matr) return;
						Ti.API.info("Conferma della matricola: "+$.args['dipendente'].n_matr);
					}
					else {
						Ti.API.info("Conferma della matricola: "+$.args['dipendente'].n_matr);
						if (Number(e.text) != $.args['dipendente'].n_matr) return;
					}					
				}
				else {
					/**
 					* AGGIUNGERE SCANSIONE
 					*/
				}
				
				/*
				* Per ogni riga della tableView, se il valore dello switch è falso
				* allora lo aggiungo ad arrayNomi.
				*/				
				var arrayNomi = [];
				for (var key in dizModifiche){
					if (dizModifiche[key] == false){					
						arrayNomi.push(key);
					}
				}				
				
				//Creazione JSON
				var messaggio = '{';
				if (arrayNomi.length != 0){
	
					messaggio += '"controlli":[';
					var i=0;
					for (i=0; i<arrayNomi.length; i++){
						messaggio += '{"titolo":"'+arrayNomi[i]+'"}';
						if (i< (arrayNomi.length -1))
							messaggio += ',';
					}			
					messaggio += ']';											
				}				
				messaggio += '}';
								
				invioSegnalazione(messaggio);
				
				$.args['dipendente'].fatto = 'T';			
				$.detail.close();			
			}
		});
		
		$.dConferma.show();	
	}
