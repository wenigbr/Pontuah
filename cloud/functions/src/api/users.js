module.exports = function (app) {
	const BASE = '/users';

	// list all
	app.http.get(BASE, (req, res) => {
		return res.status(200).json([
			{
				name: "Brumas Cafe",
				img: "test.png"
			}
		]);  
	});

	// add
	app.http.post(BASE, (req, res) => {
		/*return res.status(200).json({
			added: true			
		});*/

		var post = req.body;

		if (!post.email || !post.password || !post.document) {
			return app.onError(res, "Missing email, password or document");
		}

		return app.auth.createUser({
			email: post.email,
			password: post.password,
			disabled: false	
		}).then(function(user) {
			return app.db.ref('/users').child(user.uid).update({document: post.document}).then((data) => {
				return app.onSuccess(res, {
					status: true,
					created: true
				});	
			})
		}).catch(function(e) {
			return app.onError(res, "Error to create user > " + e);
		});
	});

	// view
	app.http.get(BASE + '/:id', (req, res) => {
		return res.status(200).json({
			id: req.params.id,
			status: true
		});  
	});

	// check if user exists
	app.http.post(BASE + '/checkCPF', (req, res) => {
		var post = req.body;

		if (!post.document)
			return app.onError(res, "Invalid document");

		return app.global.getUserByCPF(post.document).then(function(user) {
			return app.onSuccess(res, {
				status: true,
				exists: true
			});
		}).catch(function(error) {
			return app.onSuccess(res, {
				status: true,
				exists: false
			});
		});
	});

	app.http.post(BASE + '/loadInfo', (req, res) => {
		var post = req.body;

		if (!post.document)
			return app.onError(res, "Invalid document");
		
		return app.global.getUserByCPF(post.document).then(function(user) {
			return app.onSuccess(res, {
				status: true,
				exists: true,
				user: user
			});
		}).catch(function(error) {
			return app.onSuccess(res, {
				status: true,
				exists: false
			});
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