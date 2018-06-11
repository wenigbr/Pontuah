var EventsManager = {
	m_pInstance: false,
	m_vecCurrentEvent: false,
	m_bCanceled: false,
	m_vecEvents: [],

	GetInstance: function() {
		if (EventsManager.m_pInstance == false)
			EventsManager.m_pInstance = new EventsManager();

		return EventsManager.m_pInstance;
	},

	CallEvent: function() {
		var args = [];
		
		_.each(arguments, function(arg, i) {
				args.push(arg);
		});

		var strName = args[0];
		args.shift();

		if (this.m_vecEvents[strName]) {
			var self = this;
			var vecEvent = this.m_vecEvents[strName];
			_.each(vecEvent, function(info, i) {
				self.m_vecCurrentEvent = vecEvent;

				if (!this.isCanceled())
					info.func.apply((info.object) ? info.object : null, args);
			});

			self.m_vecCurrentEvent = false;
			self.m_bCanceled = false;
		};
	},
	
	CancelEvent: function() {
		if (this.m_vecCurrentEvent)
			this.m_bCanceled = false;
	},

	IsCanceled: function() {
		return this.m_bCanceled;
	},

	RegisterEvent: function(strName, pFunc) {

	},

	AddEvent: function(strName, pCall, pObject) {
		if (this.m_vecEvents && !this.m_vecEvents[strName])
			this.m_vecEvents[strName] = [];

		this.m_vecEvents[strName].push({func: pCall, object: pObject});
		console.log("Event added: " + strName);
		return true;
	}
}