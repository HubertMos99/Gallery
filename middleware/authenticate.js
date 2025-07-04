const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const token = req.cookies.mytoken;
        const decode = jwt.verify(token, 'kodSzyfrujacy');
        req.user = decode;
        req.loggedUser = req.user.username;
        //res.locals.loggedUser = req.user.username;
        next();
    } catch (err) {
        res.redirect('/');
    }
};

module.exports = authenticate;
