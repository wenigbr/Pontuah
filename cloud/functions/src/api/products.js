module.exports = function (app) {
	const BASE = '/products';

	// list all
	app.http.get(BASE, (req, res) => {
		return app.global.getEstablishmentData(req, res).then(function(data) {
			var rewards = data.rewards ? data.rewards : [];
			var index = 1;
			rewards.forEach((reward) => {
				reward.id = index;
				index++;
			});

			return res.status(200).json([
				{
					status: true,
					data: rewards
				}
			]); 
		}); 
	}); 

	// add
	app.http.post(BASE, (req, res) => {
		return app.global.getEstablishmentData(req, res).then(function(data) {
			var postBody = req.body;
			var name = postBody.name;
			var points = postBody.points;

			if (!name || !points) {
				return app.onError(res, "Invalid request to add");
			}

			var rewards = data.rewards ? data.rewards : [];

			rewards.push({
				name: name,
				points: points
			});

			return app.db.ref("/establishments")
				.child(data.id)
				.child('rewards')
				.set(rewards).then(function() {
					var index = 1;
					rewards.forEach((reward) => {
						reward.id = index;
						index++;
					});
					return res.status(200).json([
						{
							status: true,
							added: true,
							data: rewards 	
						}
					]); 
				});
		});  
	});

	// view
	app.http.get(BASE + '/:id', (req, res) => {
		return res.status(200).json({
			id: req.params.id,
			status: true
		});  
	});

	// update
	app.http.post(BASE + '/:id', (req, res) => {
		return app.global.getEstablishmentData(req, res).then(function(data) {
			var postBody = req.body;
			var rewardId = req.params.id;
			var name = postBody.name;
			var points = postBody.points;

			if (!rewardId || (!name && !points)) {
				return app.onError(res, {msg: "not update", rewardId: rewardId, name: name, points: points});
			}

			var rewards = data.rewards ? data.rewards : [];
			if (!rewards[rewardId]) {
				return app.onError(res, "Invalid product");
			}

			if (name)
				rewards[rewardId].name = name;

			if (points)
				rewards[rewardId].points = points;

			return app.db.ref("/establishments")
				.child(data.id)
				.child('rewards')
				.set(rewards).then(function() {
					var index = 1;
					rewards.forEach((reward) => {
						reward.id = index;
						index++;
					});

					return res.status(200).json([
						{
							status: true,
							updated: true,
							data: rewards 	
						}
					]); 
				});
		});  
	});

	// delete
	app.http.delete(BASE + '/:id', (req, res) => {
		return app.global.getEstablishmentData(req, res).then(function(data) {
			var postBody = req.body;
			var rewardId = req.params.id;

			if (!rewardId) {
				return app.onError(res, "Invalid request to delete");
			}

			var rewards = data.rewards ? data.rewards : [];
			if (!rewards[rewardId]) {
				return app.onError(res, "Invalid product");
			}

			rewards.splice(rewardId, 1);

			return app.db.ref("/establishments")
				.child(data.id)
				.child('rewards')
				.set(rewards).then(function() {
					var index = 1;
					rewards.forEach((reward) => {
						reward.id = index;
						index++;
					});
					return res.status(200).json([
						{
							status: true,
							deleted: true,
							data: rewards 	
						}
					]); 
				});
		});    
	});
};