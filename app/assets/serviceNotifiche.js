var service = Ti.Android.currentService;
var serviceIntent = service.getIntent();
var timestamp = new Date(serviceIntent.getStringExtra('timestamp'));
//var minuti = serviceIntent.getStringExtra('minuti');

if (new Date() > timestamp) {
	
    // Grab extra data sent with the intent
    var title = serviceIntent.getStringExtra('title');
    var message = serviceIntent.getStringExtra('message');
    
    // Create an intent that launches the application
    var intent = Ti.Android.createIntent({
        action : Ti.Android.ACTION_MAIN,
        packageName: 'com.example.me',
        className: 'com.example.me.CheckTime'
    });
    intent.flags |= Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP;
    intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
  
    // Create notification
    var notification = Ti.Android.createNotification({
        contentTitle : serviceIntent.getStringExtra('title'),
        contentText :  serviceIntent.getStringExtra('message'),
        contentIntent : Ti.Android.createPendingIntent({intent : intent}), 

        //Non può essere un suono esterno
		//sound: '/android/prova.wav'
    });
    
    notification.setDefaults(Ti.Android.DEFAULT_ALL);
    // Send the notification
    Ti.Android.NotificationManager.notify(1, notification);
    
    // Stop the service once the notification is sent
    Ti.Android.stopService(serviceIntent);
} 