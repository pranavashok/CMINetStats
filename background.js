var nav = new NavigationCollector();

var eventList = [
				//'onBeforeNavigate', 
				//'onCreatedNavigationTarget',
	    		//'onCommitted', 
	    		//'onDOMContentLoaded',
	    		'onCompleted', 
	    		'onErrorOccurred', 
	    		//'onReferenceFragmentUpdated', 
	    		//'onTabReplaced',
	    		//'onHistoryStateUpdated'
	    		];

eventList.forEach(function(e) {
	chrome.webNavigation[e].addListener(function(data){
		nav.storeTimingData(data, e);
	});
});

chrome.runtime.onStartup.addListener(function() {
	nav.resetDataStorage();
});

chrome.browserAction.onClicked.addListener(function(tab) {
	var timing = nav.getTimingData();
	nav.sendLogsToServer(timing, "http://localhost/netdata.php");
	console.log(timing);
});