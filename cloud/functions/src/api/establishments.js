module.exports = function (app) {
	const BASE = '/establishments';
	const PAGE_SIZE = 10;

	// list all
	app.http.get(BASE, (req, res) => {
		return app.db.ref('count').child('establishments').once('value').then(function(snapTotal) {
			return app.db.ref(BASE)
				.orderByChild("timestamp")
				.limitToFirst(PAGE_SIZE)
				.once('value').then((snaps) => {
					var result = [];
					snaps.forEach((child) => {
						var temp = child.val();
						temp.id = child.ref.getKey();
						result.push(temp);
					});

					return res.status(200).json({
						status: true,
						total: snapTotal.val() ? snapTotal.val() : 0,
						resultTotal: result.length,
						pageTotal: PAGE_SIZE,
						data: result
					}); 
				});	
		});
		
	});

	// add
	app.http.post(BASE, (req, res) => {
		var postBody = req.body;
		postBody.timestamp = Date.now();
		return app.db.ref(BASE).push(postBody).then((snap) => {
			postBody.unique_id = snap.key;
			return res.status(200).json({
				status: true,
				data: postBody
			});  
		});
	});

	// view
	app.http.get(BASE + '/:id', (req, res) => {
		return app.db.ref(BASE)
				.child(req.params.id)
				.once('value').then((snap) => {
					var result = snap.val();
					result.latitude = parseFloat(result.latitude);
					result.longitude = parseFloat(result.longitude);
					result.id = snap.ref.getKey();

					return res.status(200).json({
						status: true,
						data: result
					}); 
				});	
	});

	// update
	app.http.post(BASE + '/:id', (req, res) => {
		var postBody = req.body;
		return app.global.getEstablishmentData(req, res).then(function(data) {

			// merge data
			data = Object.assign(data, postBody);

			return app.db.ref(BASE)
					.child(data.id)
					.set(data).then(function(snap) {
						return res.status(200).json({
							status: true,
							updated: true,
							data: data
						});			
					});
			
		}).catch(function(error) {
			return app.onError(res, "Invalid user");
		});
	});

	return {
		count: app.funcDb.ref(BASE + '/').onWrite(event => {
			console.log(BASE + ' number : ', event.data.numChildren());
			return event.data.ref.parent.child('count' + BASE).set(event.data.numChildren());
		})
	};
}