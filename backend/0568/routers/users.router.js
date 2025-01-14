const { Router } = require("express");
const router = Router();
const UserModel = require("../models/users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
	console.log("requesting....")
	const user = await UserModel.find();
	console.log('👻 -> file: users.router.js:9 -> router.get -> user:', user)
	res.status(200).json(user);
});

router.get("/:id", async (req, res) => {
	const { id } = req.params;
	const user = await UserModel.findById(id);
	res.status(200).json(user);
});

router.post("/register", async (req, res) => {
	const user = new UserModel(req.body);
	const { password } = req.body;
	try {
		bcrypt.hash(password, 5, async (err, hash) => {
			if (err) {
				res.status(500).json({ err: err.message });
			} else {
				user.password = hash;
				await user.save();
			}
		});
		res.status(200).json({ msg: "User registered successfully" });
	} catch (error) {
		res.status(500).json({ err: error.message });
	}
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await UserModel.findOne({ email });
		bcrypt.compare(password, user.password, (err, result) => {
			if (err) {
				res.status(500).json({ err: err.message });
			} else if (!result) {
				res.status(400).json({ msg: "Invalid credentials" });
			} else {
				const token = jwt.sign(
					{ authorID: user._id, author: user.name },
					"secret",
					{ expiresIn: "1h" }
				);
				res.status(200).json({
					msg: "User logged in successfully",
					token,
				});
			}
		});
	} catch (error) {
		res.status(400).json({ err: error.message });
	}
});

router.patch("/update/:id", async (req, res) => {
	const { id } = req.params;
	const { password } = req.body;
	const user = UserModel.findById(id);
	if (!user) return res.status(400).json({ msg: "User not found" });
	try {
		bcrypt.hash(password, 5, async (err, hash) => {
			if (err) {
				res.status(500).json({ err: err.message });
			} else {
				req.body.password = hash;
				await UserModel.findByIdAndUpdate(id, req.body);
				res.send({ msg: "User updated successfully" });
			}
		});
	} catch (error) {
		res.status(500).json({ err: error.message });
	}
});

router.delete("/delete/:id", async (req, res) => {
	const { id } = req.params;
	const user = UserModel.findById(id);
	if (!user) return res.status(400).json({ msg: "User not found" });
	try {
		await UserModel.findByIdAndDelete(id);
		res.status(200).json({ msg: "User deleted successfully" });
	} catch (error) {
		res.status(500).json({ err: error.message });
	}
});

module.exports = router;
