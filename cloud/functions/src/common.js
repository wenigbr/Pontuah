module.exports = function (app) {
	var getEstablishmentData = function(req, res) {
		return new Promise(function(resolve, reject) {
			return app.checkAuth(req.headers['user-token']).then(function(decodedToken) {
				return app.db.ref('/establishmentUsers')
					.child(decodedToken.uid)
					.once('value').then(function(snapEstablishment) {
						return app.db.ref('/establishments')
							.child(snapEstablishment.val())
							.once('value').then(function(snap) {
								var data = snap.val();
								data.id = snap.ref.getKey();
								return resolve(data);
							}).catch(function(err) {
								return reject("Invalid establishment");
							});

					}).catch(function(err) {
						return reject(err);
					});
			}).catch(function(error) {
				return reject("Invalid user to get data");
			});
		});
	};

	var getUserByCPF = function(strDocument) {
		return new Promise(function(resolve, reject) {
			return app.db.ref('/users')
				.orderByChild("document")
				.equalTo(strDocument)
				.once('value').then(function(snapUser) {
					if (!snapUser.exists()) {
						return reject("Invalid user");
					}

					var user = snapUser.val();
					var keys = Object.keys(user);
					user[keys[0]].id = keys[0];
					resolve(user[keys[0]]);
				}).catch(function(error) {
					return reject("Invalid user");
				});

		});
	};

	return {
		getEstablishmentData: getEstablishmentData,
		getUserByCPF: getUserByCPF
	};
};