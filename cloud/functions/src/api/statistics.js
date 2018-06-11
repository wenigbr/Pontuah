module.exports = function (app) {
	const BASE = '/statistics';

	const asyncMiddleware = fn =>
	  (req, res, next) => {
	    Promise.resolve(fn(req, res, next))
	      .catch(next);
	  };

	// list all
	app.http.get(BASE, function(req, res, next) {
		return app.global.getEstablishmentData(req, res).then(function(establishment) {
			return Promise.all([
				new Promise(function(resolve, reject) {
					/*app.db.ref('count').child('users').once('value').then(function(data) {
						resolve([
							['totalUsers', data.val()]
						]);
					}).catch(reject);*/

					app.db.ref('points').once('value').then(function(data) {
						var totalUsers = 0;
						if (data.exists()) {
							data.forEach(function(users) {
								users.forEach(function(ests) {
									if (establishment.id == ests.ref.getKey()) {
										totalUsers++;
									}
								})
							})
						}

						resolve(
							[
								['totalUsers', totalUsers],
							]
						);
					}).catch(reject);
				}),
				new Promise(function(resolve, reject) {
					app.db.ref('productsRedeemed').once('value').then(function(data) {
						var totalProducts = 0;
						if (data.exists()) {
							data.forEach(function(users) {
								users.forEach(function(ests) {
									if (establishment.id == ests.ref.getKey()) {
										ests.forEach(function(est, key) {
											totalProducts++;
										});
									}
								})
							})
						}

						resolve(
							[
								['totalProducts', totalProducts],
							]
						);
					}).catch(reject);
				}),
				new Promise(function(resolve, reject) {
					app.db.ref('points').once('value').then(function(data) {
						var totalPoints = 0;
						var totalUsers = 0;
						var pointsGroup = {};
						var usersGroup = {};
						var usersAux = {};

						var today = new Date();
					    var dtLastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

						if (data.exists()) {
							console.log("existsss!!!");
							data.forEach(function(users) {
								console.log("users", users);
								users.forEach(function(ests) {
									console.log("ests", ests);
									console.log("ests sovai", ests.ref.getKey());
									if (establishment.id == ests.ref.getKey()) {
										ests.forEach(function(est, key) {
											var estData = est.val();
											totalPoints += estData.points;
											totalUsers++;

											console.log('estTime', estData.timestamp);
											console.log('dtLastWeek', dtLastWeek.getTime());
											if (estData.timestamp > dtLastWeek.getTime()) {
												var dtEst = new Date(estData.timestamp);
												var strDate = ("0" + dtEst.getDate()).slice(-2) + "/" + ("0"+(dtEst.getMonth()+1)).slice(-2) + "/" + dtEst.getFullYear();

												if (!pointsGroup[strDate])
													pointsGroup[strDate] = 0;

												pointsGroup[strDate] += estData.points;													 
											
												if (!usersAux[strDate])
													usersAux[strDate] = {};

												if (!usersAux[strDate][users.ref.getKey()]) {
													if (!usersGroup[strDate])
														usersGroup[strDate] = 0;

													usersGroup[strDate]++;
													usersAux[strDate][users.ref.getKey()] = true;													 
												}
											}
										});
									}
								});
							});
						}

						resolve(
							[
								['points', totalPoints],
								['users', totalUsers],
								['pointsGroup', pointsGroup],
								['usersGroup', usersGroup]
							]
						);
					}).catch(reject);
				})
			]).then(function(results) {
				var data = results.reduce(function (result, item) {
					item.forEach(function(v) {
						var key = v[0],
		                value = v[1];
		           	 	result[key] = value;	
					})
		            return result;	
		        }, {});

				return app.onSuccess(res, {
					status: true,
					data: data
				});
			}).catch(next);
		}).catch(function(e) {
			return app.onError(res, "Invalid user to get statistics");
		});
	});
};