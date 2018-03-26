	// Arguments passed into this controller can be accessed via the `$.args` object directly or:
	//var dip = $.args['persona'];
	
	
	
	if (!$.args['DEBUG']) {
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
	
			for (i=0; i<$.args['persona'].controlli.length; i++){
				
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
					text: $.args['persona'].controlli[i].titolo,
					left: "2%",
					color: 'black',
					font: {
						fontSize: 18,
						fontFamily: 'Helvetica Neue'					
					}
				}));
				
				var statoSwitch = ($.args['persona'].controlli[i].value == 'F') ? false : true;
				
				var s = Ti.UI.createSwitch({
					value: statoSwitch,
					titolo: $.args['persona'].controlli[i].titolo,
					id: $.args['persona'].controlli[i].id,
					nome: $.args['persona'].controlli[i].titolo,
					right: '2%',					
				});
				
				if ($.args['isAndroid']) {
					s.setBackgroundColor('lightgray');
					s.setBorderColor('gray');
					s.setBorderRadius(5);				
				}
				
				dizModifiche[$.args['persona'].controlli[i].titolo] = statoSwitch;
				
				s.addEventListener('change', function(e){					
					dizModifiche[this.titolo] = e.value;
					//console.log(this.titolo+" ---> "+e.value);										
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
		Ti.API.info("Invio JSON a: "+$.args['urlInvio'] + $.args['persona'].n_matr + '/done/');
		client.open(
			"POST",
			$.args['urlInvio'] + $.args['persona'].n_matr + '/done/',
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
		/*
		var dConferma = Ti.UI.createAlertDialog({
			title: "Riepilogo",
			message: testo,
			buttonNames: ['Annulla','Ho preso visione.'],
			font: {
				fontSize: 16
			}
		});
		*/
		
		if ($.args['isAndroid']){
			
		}
		else {
			$.dConferma.setPersistent(true);
			$.dConferma.setStyle(Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);		

		}
		
		$.dConferma.addEventListener('click', function(e){
			Ti.API.info("INDICE: "+e.index);
			if (e.index == 0) {
				Ti.API.info("Annullamento");
			}
			else {
	
				Ti.API.info("Il dipendente ha confermato");
				if ($.args['noScan']){
					Ti.API.info("Acquisizione sospesa --> $.args['DEBUG']");
					Ti.API.info("Conferma con matricola");
					
					/*
					if (
						($.args['isAndroid'] && $.inputConferma.value == $.args['persona'].n_matr) ||
						($.args['isAndroid'] == false && e.text == $.args['persona'].n_matr) == false
						) { 
						return;
					}
					else {
							
					}
					*/
				}
				else {
				/**
				 * SCANSIONE: se il codice è giusto ritorno TRUE e poi procedo con l'invio delle segnalazioni.
				 */	
					var openScanner = function() {
					    // First set the app key and which direction the camera should face.
					    scanditsdk.appKey = "--- ENTER YOUR SCANDIT APP KEY HERE ---"; 
					    scanditsdk.cameraFacingPreference = 0;
					    // Only after setting the app key instantiate the Scandit SDK Barcode Picker view
					    var picker = scanditsdk.createView({
					        width:"100%",
					        height:"100%"
					    });
					    // Before calling any other functions on the picker you have to call init()
					    picker.init();
					    // add a tool bar at the bottom of the scan view with a cancel button (iphone/ipad only)
					    picker.showToolBar(true);
					    // enable a few of the barcode symbologies. Note that the below list of symbologies 
					    // is already enabled by default in Titanium. These calls are shown for illustration 
					    // purposes. In your application make sure to only enable symbologies that you actually 
					    // require and turn off anything else as every additional enabled symbology slows 
					    // down recognition.
					    picker.setEan13AndUpc12Enabled(true);
					    picker.setEan8Enabled(true);
					    picker.setUpceEnabled(true);
					    picker.setCode39Enabled(true);
					    picker.setCode128Enabled(true);
					    picker.setQrEnabled(true);
					    picker.setDataMatrixEnabled(true);
					    // Create a window to add the picker to and display it. 
					    var window = Titanium.UI.createWindow({  
					            title:'Scandit SDK',
					            navBarHidden:true
					    });
					    
					    // Set callback functions for when scanning succeeds and for when the 
					    // scanning is canceled. This callback is called on the scan engine's
					    // thread to allow you to synchronously call stopScanning or
					    // pauseScanning. Any UI specific calls from within this function 
					    // have to be issued through setTimeout to switch to the UI thread
					    // first.
					    picker.setSuccessCallback(function(e) {
					        picker.stopScanning();
					        
					        setTimeout(function() {
					            window.close();
					            window.remove(picker);
					            alert("success (" + e.symbology + "): " + e.barcode);
					        }, 1);
					    });
					    picker.setCancelCallback(function(e) {
					        picker.stopScanning();
					        window.close();
					        window.remove(picker);
					    });
					    window.add(picker);
					    window.addEventListener('open', function(e) {
					        picker.startScanning();     // startScanning() has to be called after the window is opened. 
					    });
					    window.open();
					};
				// Create button to open and start the scanner
					var button = Titanium.UI.createButton({
					    "width":200,
					    "height": 80,
					    "title": "start scanner"
					});
					button.addEventListener('click', function() {
					    openScannerIfPermission();
					});
					var rootWindow = Titanium.UI.createWindow({
					    backgroundColor:'#000'
					});
					rootWindow.add(button);
					rootWindow.open();
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
				/**
				 * Se ci sono dei controlli negativi, ovvero se arrayNomi è vuoto,
				 * creo ed invio un json.
				 */
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
				/**
				 * Invio anche in caso non ci siano controlli
				 * con esito negativo.
				 * In questo modo riesco (da server) a impostare come
				 * 'fatto' un dipendente.
				 */
				invioSegnalazione(messaggio);
				
				$.args['persona'].fatto = 'T';			
				$.detail.close();			
			}
		});
		
		$.dConferma.show();	
	}
