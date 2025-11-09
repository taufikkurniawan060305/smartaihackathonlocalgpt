const express = require("express");

const router = express.Router();
const { circloHookHandler } = require("../handlers/circlo.handler");


router.post("/", circloHookHandler);


module.exports = router;