import express from "express";
const router = new express.Router();
import http from "http";

router.post("/save", (req, res) => {
    let id = req.body.preset;
    if (id.length === 1) {
        id = `0${id}`;
    }
    http.get({
        host: "192.168.10.101",
        path: `/cgi-bin/aw_ptz?cmd=%23M${id}&res=1`,
    }, (response) => {
        if (response.statusCode === 200) {
            res.status(200).json({
                succeeded: true,
                message: `Saved preset ${id}.`,
            });
        } else {
            res.status(504).json({
                message: `Unable to save preset ${id}.`,
            });
        }
    });
});

router.post("/recall", (req, res) => {
    let id = req.body.preset;
    if (id.length === 1) {
        id = `0${id}`;
    }
    http.get({
        host: "192.168.10.101",
        path: `/cgi-bin/aw_ptz?cmd=%23R${id}&res=1`,
    }, (response) => {
        if (response.statusCode === 200) {
            res.status(200).json({
                succeeded: true,
                message: `Recalled preset ${id}.`,
            });
        } else {
            res.status(504).json({
                message: `Unable to recall preset ${id}.`,
            });
        }
    });
});

router.get("/stop", (req, res) => {
    http.get({
        host: "192.168.10.101",
        path: "/cgi-bin/aw_ptz?cmd=%23PTS5050&res=1",
    }, (response) => {
        if (response.statusCode === 200) {
            res.status(200).json({
                succeeded: true,
                message: "Stopped camera.",
            });
        } else {
            res.status(504).json({
                message: "Unable to stop camera.",
            });
        }
    });
});

router.post("/pan", (req, res) => {
    const body = req.body;
    if (!body.direction || !body.speed) {
        res.status(400).json({
            message: "Request has to contain: direction, speed." });
        return;
    }
    if (body.direction.toLowerCase() !== "left" && body.direction.toLowerCase() !== "right") {
        res.status(400).json({
            message: `Direction has to be left or right! ${body.direction} is not allowed!`,
        });
        return;
    }
    if (body.speed > 49 || body.speed < 1) {
        res.status(400).json({
            message: `Speed has to be between 1 and 49. ${body.speed} is not allowed!`,
        });
        return;
    }

    const speed = (body.direction.toLowerCase() === "left") ? 50 - body.speed : 50 + body.speed;
    http.get({
        host: "192.168.10.101",
        path: `/cgi-bin/aw_ptz?cmd=%23P${speed}&res=1`,
    }, (response) => {
        if (response.statusCode === 200) {
            res.status(200).json({
                succeeded: true,
                message: `Camera moving ${body.direction} at speed ${body.speed}.`,
            });
        } else {
            res.status(504).json({
                message: "Unable to move camera.",
            });
        }
    });
});


router.post("/tilt", (req, res) => {
    const body = req.body;
    if (!body.direction || !body.speed) {
        res.status(400).json({
            message: "Request has to contain: direction, speed.",
        });
        return;
    }
    if (body.direction.toLowerCase() !== "up" && body.direction.toLowerCase() !== "down") {
        res.status(400).json({
            message: `Direction has to be up or down! ${body.direction} is not allowed!`,
        });
        return;
    }
    if (body.speed > 49 || body.speed < 1) {
        res.status(400).json({
            message: `Speed has to be between 1 and 49. ${body.speed} is not allowed!`,
        });
        return;
    }

    const speed = (body.direction.toLowerCase() === "down") ? 50 - body.speed : 50 + body.speed;
    http.get({
        host: "192.168.10.101",
        path: `/cgi-bin/aw_ptz?cmd=%23T${speed}&res=1`,
    }, (response) => {
        if (response.statusCode === 200) {
            res.status(200).json({
                succeeded: true,
                message: `Camera moving ${body.direction} at speed ${body.speed}.`,
            });
        } else {
            res.status(504).json({
                message: "Unable to move camera.",
            });
        }
    });
});

module.exports = router;