// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var dip = $.args;


var scanditsdk = require("com.mirasense.scanditsdk");

var urlBase = "http://127.0.0.1:8000/";
var urlInvio = urlBase + "checks/segnalazione/";
 
//Conterrà i valori degli switch. 
 var dizModifiche = {};

 
//scanditsdk.appKey = "";
scanditsdk.cameraFacingPreference = 0;    // 0 = back, 1 = front



var arrayControlli = [];
//Creazione tabella con controlli.

for (iter=0; iter<2; iter++){
	if (iter==0){

		for (i=0; i<dip.controlli.length; i++){
			var c = Ti.UI.createTableViewRow({
				title: dip.controlli[i].titolo,
			});
			
			var statoSwitch;
			if (dip.controlli[i].value == 'F')
				statoSwitch = false;
			else
				statoSwitch = true;
			
			var s = Ti.UI.createSwitch({
				value: statoSwitch,
				id: i,
				nome: dip.controlli[i].titolo,
				right: '2%',
				height: '10%'
			});
			
			dizModifiche[dip.controlli[i].titolo] = statoSwitch;
			
			s.addEventListener('change', function(e){
				
				var id = this.id;
				var nome = this.nome;
				
				dizModifiche[this.nome] = e.value;
				console.log("Nome: "+this.nome+" ---> "+e.value);
				
				/*
				for (var key in dizModifiche)
					console.log(key+' - '+dizModifiche[key]);
				*/
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
	
	client.open(
		"POST",
		urlInvio + dip.n_matr + '/',
		true);
	client.setRequestHeader(
		'Content-Type',
		'application/json; charset=UTF-8'
		);
		
	client.send(oggetto);

}


function conferma(){
	
	var dConferma = Ti.UI.createAlertDialog({
		title: "Conferma da parte del dipendente",
		message: "Riepilogo: ",
		buttonNames: ['Annulla','Ho preso visione.']
	});
	
	dConferma.addEventListener('click', function(e){
		
		if (e.index == 0) {
			console.log("Annullamento");
		}
		else {
			console.log("Conferma data");
			
			// ------------------------------------------------ Apertura acquisizione QR code
			/* VAR 1
			var openScanner = function() {
			    // First set the license key and which direction the camera should face.
			    scanditsdk.appKey = "-- ENTER YOUR SCANDIT LICENSE KEY HERE --"; 
			    scanditsdk.cameraFacingPreference = 0;
			    // Only after setting the license key instantiate the Scandit SDK Barcode Picker view
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
			*/
		
			/* VARIANTE
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
						// Only after setting the license key instantiate the Scandit Barcode Picker view.
			picker = scanditsdk.createView({
			    width:"100%",
			    height:"100%"
			});
			picker.init();
			*/
			
			// ----> INVIO JSON AL SERVER
		
			/*
			 * Per ogni riga della tableView, se il valore è falso allora lo aggiungo al json.
			 */
			var messaggio = '{"controlli":[';
			var arrayNomi = [];
			for (var key in dizModifiche){
				
				if (dizModifiche[key] == false){					
					arrayNomi.push(key);
				}
			}
			
			var i=0;
			for (i=0; i<arrayNomi.length; i++){
				messaggio += '{"titolo":"'+arrayNomi[i]+'"}';
				if (i< (arrayNomi.length -1))
					messaggio += ',';
					
			}
			
			messaggio += ']}';
			console.log(messaggio);
			invioSegnalazione(messaggio);
			
			dip.fatto = 'T';
			console.log(dip.fatto);
			$.detail.close();
			
			
		}
	});
	
	dConferma.show();
	
}
