import fs from "fs";
import CameraShot from "../objects/CameraShot";
import CameraTimeline from "../objects/CameraTimeline";
import xml2js from "xml2js";
import Camera from "./Camera";

const parser = new xml2js.Parser();

// Singleton Object
let projectManagerInstance = null;

/*
 * Class for storing a Project
 */
class ProjectManager {

    constructor() {
        if (!projectManagerInstance) {
            projectManagerInstance = this;

            this.initialized = false;
            if (typeof this.data === "undefined") {
                this.parseXML();
            } else {
                this.initialized = true;
            }
        }

        return projectManagerInstance;
    }

    // Get max and mincount of an array of shots
    getMaxAndMinCount(flattenedCameraTimelines) {
        // Calculate minimum and maximum counts
        let minCount = 0;
        let maxCount = 0;
        if (flattenedCameraTimelines.length > 0) {
            minCount = Number(flattenedCameraTimelines[0].beginCount);
            maxCount = Number(flattenedCameraTimelines[0].endCount);
            flattenedCameraTimelines.forEach(shot => {
                if (shot.beginCount < minCount) {
                    minCount = Number(shot.beginCount);
                }
                if (shot.endCount > maxCount) {
                    maxCount = Number(shot.endCount);
                }
            });
        }

        return { minCount, maxCount };
    }

    parseXML() {
        fs.readFile(`${__dirname}/../project-scp-files/project.scp`, (err, data) => {
            if (err) {
                // TODO something with the errorf
                this.data = null;
                this.initialized = true;
            } else {
                parser.parseString(data, (err, result) => {
                    // Read timelines from xml
                    const cameraTimelinesXML =
                        result.scriptingProject["camera-centerarea"][0].cameraTimeline;

                    const cameraTimelines = [];
                    const flattenedTimelines = [];

                    // Insert shots in timeline which is pushed to timelinesarray
                    // and push to flattenedArray
                    cameraTimelinesXML.forEach((timeline) => {
                        // Get camera
                        const camera = Camera.fromXML(timeline.camera[0]);

                        // Make cameraTimeline
                        const cameraTimeline = new CameraTimeline(
                            camera.name, camera.description, camera);

                        // Parse and add shots
                        if (typeof timeline.shotList[0].shot !== "undefined") {
                            timeline.shotList[0].shot.forEach(shot => {
                                const cameraShot = new CameraShot(shot.beginCount[0],
                                    shot.endCount[0], shot.name[0], shot.description[0]);
                                cameraTimeline.addCameraShot(cameraShot);
                                flattenedTimelines.push(cameraShot);
                            });
                        }
                        cameraTimelines.push(cameraTimeline);
                    });
                    const minMaxCount = this.getMaxAndMinCount(flattenedTimelines);
                    this.data = { cameraTimelines,
                        minCount: minMaxCount.minCount,
                        maxCount: minMaxCount.maxCount };
                    this.initialized = true;
                });
            }
        });
    }

    filterTimelines(pickedTimelines, data) {
        const flattenedTimelines = [];
        const resultingData = {};
        resultingData.cameraTimelines = [];

        data.cameraTimelines.forEach((timeline, index) => {
            if (pickedTimelines.indexOf(index) >= 0) {
                flattenedTimelines.concat(timeline.getCameraShots);
                resultingData.cameraTimelines.push(timeline);
            }
        });

        const minMaxCount = this.getMaxAndMinCount(flattenedTimelines);
        resultingData.minCount = minMaxCount.minCount;
        resultingData.maxCount = minMaxCount.maxCount;
        return resultingData;
    }
}

export default ProjectManager;