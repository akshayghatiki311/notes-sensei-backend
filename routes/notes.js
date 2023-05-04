const express = require("express");
const router = express.Router();


router.get('/',(req,res)=>{
    out = {
        a:"notes",
        num:34
    };
    res.json(out);
});

module.exports = router;