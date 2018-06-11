module.exports = function (app) {
	const BASE = '/points';
	const PAGE_SIZE = 10;

	var getMultipleData = function (strPath, key_arr) {
		return new Promise((res, rej) => {  
		     return Promise.all(key_arr.map(function (key_str) {
        		return new Promise(function (resolve, reject) {
		            app.db.ref(strPath+'/'+key_str).once('value', function (snapshot) {
		                resolve ([key_str, snapshot.val()]);
					});
				});
		    })).then(function (results) {
		        var data = results.reduce(function (result, item) {
		            var key = item[0],
		                value = item[1];
		            result[key] = value;
		            return result;	
		        }, {});

		        res(data);
		    });
		});
	};

	// list all
	app.http.get(BASE, (req, res) => {
		return app.checkAuth(req.headers['user-token']).then(function(decodedToken) {
			return app.db.ref(BASE)
				.child(decodedToken.uid)
				.once('value').then((snapPoints) => {
					var points = {};
					snapPoints.forEach((child) => {
						var temp = child.val();
						points[child.ref.getKey()] = temp;
					});

					var establishmentKeys = Object.keys(points);
					getMultipleData('/establishments', establishmentKeys).then((data) => {
						var result = [];
						Object.keys(data).forEach((key) => {
							var tempTotal = points[key].stats.points;	
							/*var tempPoints = points[key];
							if (tempPoints) {
								Object.keys(tempPoints).forEach((p) => {
									tempTotal += tempPoints[p].points;
								});
							}*/

							data[key].id = key;
							data[key].points = tempTotal;
							result.push(data[key]);
						});

						return res.status(200).json({
							status: true,
							data: result
						});
					});
				}).catch((error) => {
					return res.status(200).json({
						status: true,
						data: data
					});  
				});	
		}).catch(function(error) {
			app.onError(res, "Invalid user: " + error);
		});
	});

	// add
	app.http.post(BASE, (req, res) => {
		var postBody = req.body;
		var strDocument = postBody.document;
		var establishmentId = postBody.establishmentId;

		if (!strDocument || !establishmentId) {
			return app.onError(res, "Invalid request: " + strDocument + ', ' + establishmentId);
		}

		return app.db.ref('/users')
				.orderByChild("document")
				.equalTo(strDocument)
				.once('value').then((snapUser) => {
					if (!snapUser.exists()) {
						return app.onError(res, "Invalid user to add points1");
					}

					var userId = Object.keys(snapUser.val())[0];

					return app.db.ref('/establishments')
						.child(establishmentId)
						.once('value').then((snapEstablishment) => {
							if (!snapEstablishment.exists()) {
								return app.onError(res, "Invalid establishment to add points");
							}

							var establishmentId = snapEstablishment.ref.getKey();

							return app.db.ref(BASE)
								.child(userId+'/'+establishmentId+'/stats')
								.once('value').then((statsSnap) => {
									var toAdd = parseInt(snapEstablishment.val().addPoints ? snapEstablishment.val().addPoints : 10);

									var stats = statsSnap.val();
									if (!stats) {
										stats = {
											lastEarned: Date.now(),
											points: 0
										}
									} else {
										if (stats.lastEarned > (Date.now() - (3600*1000))) {
											return res.status(200).json({
												status: true,
												data: {
													userId: userId,
													establishmentId: establishmentId,
													totalPoints: stats.points,
													toAdd: toAdd,
													added: false
												}
											}); 
										}
									}

									stats.points += toAdd;
									stats.lastEarned = Date.now();
									app.db.ref(BASE).child(userId+'/'+establishmentId+'/stats').set(stats);

									var data = {
										points: toAdd,
										timestamp: Date.now()
									};

									return app.db.ref(BASE).child(userId+'/'+establishmentId).push(data).then((snap) => {
										return res.status(200).json({
											status: true,
											data: {
												userId: userId,
												establishmentId: establishmentId,
												totalPoints: stats.points,
												toAdd: toAdd,
												added: true
											}
										});  
									});
								});
						}).catch((error) => {
							return app.onError(res, "Invalid establishment to add points.");
						});

				}).catch((error) => {
					return app.onError(res, "Invalid user to add points: " + error);
				});	
	});


	// add
	app.http.post(BASE + '/redeem', (req, res) => {
		var postBody = req.body;
		var userId = postBody.userId;
		var establishmentId = postBody.establishmentId;
		var productName = postBody.product;
		var productPoints = postBody.points;

		if (!userId || !establishmentId || !productName || !productPoints) {
			return app.onError(res, "Invalid request");
		}

		return app.db.ref('/users')
				.child(userId)
				.once('value').then((snapUser) => {
					if (!snapUser.exists()) {
						return app.onError(res, "Invalid user to redeem product");
					}

					return app.db.ref('/establishments')
						.child(establishmentId)
						.once('value').then((snapEstablishment) => {
							if (!snapEstablishment.exists()) {
								return app.onError(res, "Invalid establishment to redeem product");
							}

							var establishmentId = snapEstablishment.ref.getKey();
							return app.db.ref(BASE)
								.child(userId+'/'+establishmentId+'/stats')
								.once('value').then((statsSnap) => {
									var stats = statsSnap.val();
									if (!stats) {
										return app.onError(res, "Invalid stats");
									}

									stats.points -= productPoints;
									app.db.ref(BASE).child(userId+'/'+establishmentId+'/stats').set(stats);

									var data = {
										productName: productName,
										timestamp: Date.now(),
										productPoints: productPoints,
										userPoints: stats.points
									};

									return app.db.ref('/productsRedeemed').child(userId+'/'+establishmentId).push(data).then((snap) => {
										return res.status(200).json({
											status: true,
											data: {
												userId: userId,
												establishmentId: establishmentId,
												totalPoints: stats.points,
												redeemed: true
											}
										});  
									});
								});
						}).catch((error) => {
							return app.onError(res, "Invalid establishment to add points. " + error);
						});

				}).catch((error) => {
					return app.onError(res, "Invalid user to add points: " + error);
				});	
	});

	// view
	app.http.get(BASE + '/:id', (req, res) => {
		return app.checkAuth(req.headers['user-token']).then(function(decodedToken) {
			var userId = decodedToken.uid;
			var establishmentId = req.params.id;

			return app.db.ref('/establishments')
						.child(establishmentId)
						.once('value').then((snapEstablishment) => {
							if (!snapEstablishment.exists()) {
								return app.onError(res, "Invalid establishment to view");
							}

							var establishmentId = snapEstablishment.ref.getKey();
							var data = Object.assign({}, snapEstablishment.val());
							data.id = establishmentId;
							data.points = 0;

							return app.db.ref(BASE)
								.child(userId+'/'+establishmentId+'/stats')
								.once('value').then((snapPoints) => {
									var stats = snapPoints.val();
									var points = stats.points;
									/*snapPoints.forEach((child) => {
										var temp = child.val();
										points += temp.points;
									});*/

									data.points = points;
									return res.status(200).json({
										status: true,
										data: data
									});
								}).catch((error) => {
									return res.status(200).json({
										status: true,
										data: data
									});  
								});				
						}).catch((error) => {
							return app.onError(res, "Invalid establishment to get points.");
						});

		}).catch(function(error) {
			app.onError(res, "Invalid user: " + error);
		});
	});

	// update
	app.http.post(BASE + '/:id', (req, res) => {
		return res.status(200).json({
			id: req.params.id,
			updated: true,
			status: true
		});  
	});

	return {
		count: app.funcDb.ref(BASE + '/').onWrite(event => {
			console.log(BASE + ' number : ', event.data.numChildren());
			return event.data.ref.parent.child('count' + BASE).set(event.data.numChildren());
		})
	};
}