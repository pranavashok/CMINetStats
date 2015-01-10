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

	createPending_: function(s, data, e) {
		this.pending_ = {};
		this.pending_["id"] = data.tabId + '-' + String(data.timeStamp).substr(0,13);
		this.pending_["timestamp"] = data.timeStamp;
		this.pending_["url"] = data.url;
		this.pending_["timing"] = JSON.parse(s);
		this.pending_["state"] = e;
		this.pending_["timing"]["duration"] = (e == "onDOMContentLoaded" ? (this.pending_["timing"]["domInteractive"] - this.pending_["timing"]["navigationStart"]) : (this.pending_["timing"]["loadEventEnd"] - this.pending_["timing"]["navigationStart"]));
		this.pending_["error"] = 0;
		//console.log(this.pending_);
		if(e == "onCompleted") {
			this.completed_ = this.completed_ || [];
			this.completed_[this.pending_["id"]] = [];
			this.completed_[this.pending_["id"]] = this.pending_;
			this.saveDataStorage_();
			delete this.pending_;
		}
	},

	storeTimingData: function(data, e) {
		if(data.frameId != 0)
				return;
		if(e == "onCompleted" /*|| e == "onDOMContentLoaded"*/) {
			var self = this;
			chrome.tabs.executeScript(data.tabId, 
				{code: '(function() {var j = new Array(); var t = window.performance; j = t.timing; return (JSON.stringify(j));})();'},
				function(s) {
				self.createPending_.call(self, s, data, e);
			});
		}
		else {
			this.pending_ = {};
			this.pending_["error"] = 0;
			this.pending_["id"] = data.tabId + '-' + String(data.timeStamp).substr(0,13);
			this.pending_["url"] = data.url;
			this.pending_["timestamp"] = data.timeStamp;
			//console.log(this.pending_);
			if(e == "onErrorOccurred") {
				this.errored_.push(this.pending_);
				this.saveDataStorage_();
				delete this.pending_;
			}
		}
	},

	getTimingData: function() {
		this.loadDataStorage_();
		return this.completed_;
	}
};