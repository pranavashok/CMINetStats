function NavigationCollector() {
	this.pending_ = {};
	this.completed_ = {};
	this.errored_ = {};

	chrome.extension.onMessage.addListener(this.onRequestListener_.bind(this));
}

NavigationCollector.prototype = {
	parseId_: function(data) {
		return data.tabId + '-' + (data.frameId ? data.frameId : 0);
	},

	loadDataStorage_: function() {
	    chrome.storage.local.get({
	      "completed": {},
	      "errored": {},
	    }, function(storage) {
	      this.completed_ = storage.completed;
	      this.errored_ = storage.errored;
	    }.bind(this));
	},

	saveDataStorage_: function() {
	    chrome.storage.local.set({
	      "completed": this.completed_,
	      "errored": this.errored_,
	    });
	},

	resetDataStorage: function() {
	    this.completed_ = {};
	    this.errored_ = {};
	    this.saveDataStorage_();
	    // Load again, in case there is an outstanding storage.get request. This
	    // one will reload the newly-cleared data.
   		this.loadDataStorage_();
  	},

	onRequestListener_: function(request, sender, sendResponse) {
		console.log("onRequestListener_");
	    if (request.text === 'getLog')
	    	sendResponse({completed: this.getTimingData()});
	    else
	        sendResponse({});
	},

	createPending_: function(s, data, eve, error) {
		this.pending_ = {};
		this.pending_["id"] = data.tabId + '-' + String(data.timeStamp).substr(0,13);
		this.pending_["timestamp"] = data.timeStamp;
		this.pending_["url"] = data.url;
		this.pending_["timing"] = JSON.parse(s);
		this.pending_["state"] = eve;
		this.pending_["error"] = 1;
		
		if(error != 1) { //If not error
			this.pending_["timing"]["duration"] = (eve == "onDOMContentLoaded" ? (this.pending_["timing"]["domInteractive"] - this.pending_["timing"]["navigationStart"]) : (this.pending_["timing"]["loadEventEnd"] - this.pending_["timing"]["navigationStart"]));
			this.pending_["error"] = 0;
		}

		if(eve == "onCompleted")
			this.pushToCompleted_(this.pending_);
		else
			this.pushToErrored_(this.pending_);
	},

	pushToCompleted_: function(pending) {
		this.completed_ = this.completed_ || [];
		this.completed_[this.pending_["id"]] = [];
		this.completed_[this.pending_["id"]] = this.pending_;
		this.saveDataStorage_();
		delete this.pending_;
	},

	pushToErrored_: function(pending) {
		this.errored_ = this.errored_ || [];
		this.errored_[this.pending_["id"]] = [];
		this.errored_[this.pending_["id"]] = this.pending_;
		this.saveDataStorage_();
		delete this.pending_;
	},

	storeTimingData: function(data, e) {
		if(data.frameId != 0)
				return;
		if(e != "onErrorOccurred") {
			var self = this;
			chrome.tabs.executeScript(data.tabId, {code: '(function() {var j = new Array(); var t = window.performance; j = t.timing; return (JSON.stringify(j));})();'},
				function(s) {
					self.createPending_.call(self, s, data, e, 0);
				}
			);
		}
		else { //onErrorOccurred
			self.createPending_.call(self, {}, data, e, 1);
		}
	},

	getTimingData: function() {
		this.loadDataStorage_();
		return this.completed_;
	}
};