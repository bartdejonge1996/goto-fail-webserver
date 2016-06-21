import express from "express";
import BenineHelper from "../objects/BenineHelper";
import CameraShot from "../objects/CameraShot";
9
const router = express.Router(); // eslint-disable-line new-cap

// Get users data
router.get("/get-cameras", (req, res) => {
    const benineHelper = new BenineHelper();
    benineHelper.getCameras((cameras) => {
        res.json({ cameras });
    });
});

// Get users data
router.get("/get-presets", (req, res) => {
    const benineHelper = new BenineHelper();
    benineHelper.getPresets((presets) => {
        res.json({ presets });
    });
});

router.get("/recallTest", (req, res) => {
    const benineHelper = new BenineHelper();
    benineHelper.recallShot(new CameraShot(0,1,"test","description",false,1,1,[]),    (presets) => {
        res.json({ presets });
    });
});

module.exports = router;
