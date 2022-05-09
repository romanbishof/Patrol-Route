import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  createTheme,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { postRoutesAsync, setRoutePlans } from "../../redux/patroslSlice";
import { v4 as uuidv4 } from "uuid";
import Overlay from "ol/Overlay";
import { unByKey } from "ol/Observable";
import moment from "moment";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import Stroke from "ol/style/Stroke";
import markerImg from "../../images/marker.png";
import arrowImg from "../../images/arrow2.png";
import "./SetRoute.css";
import { createStringXY, format } from "ol/coordinate";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

function SetRoute() {
  const state = useSelector((state) => state.patrols);
  const [routeName, setRouteName] = useState("");
  const [routePoint, setRoutePoints] = useState([]);
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date());
  const [interval, setInterval] = useState(10);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);

  const submit = open ? "simple-popover" : undefined;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const popup = useRef();
  const theme = createTheme({
    palette: {
      primary: {
        main: state.ThemeColor,
      },
    },
  });

  const [camera, setCamera] = useState("No Camera");
  const [xenon, setXenon] = useState("No Xenon");
  const [devices, setDevices] = useState([]);
  const [coordinates, setCoordinates] = useState();
  const [lineString, setLineString] = useState([]);

  const rawCameraGUID = window.rawCamera.map((cameraObj) => cameraObj.DeviceId);
  const rawXenonGUID = window.rawXenon.map((xenonObj) => xenonObj.DeviceId);

  if (window.rawCamera.length === 0) {
    window.rawCamera.push({
      DeviceId: "No Camera",
      DeviceName: "No Camera",
    });
    state.Devices.forEach((obj) => {
      if ("rawCamera" in obj) {
        obj.rawCamera.forEach((_camera) => {
          window.rawCamera.push(_camera);
        });
      }
    });
  }

  if (window.rawXenon.length === 0) {
    window.rawXenon.push({
      DeviceId: "No Xenon",
      DeviceName: "No Xenon",
    });
    state.Devices.forEach((obj) => {
      if ("rawXenon" in obj) {
        obj.rawXenon.forEach((_xenon) => {
          window.rawXenon.push(_xenon);
        });
      }
    });
  }

  // declaring globar vector source to easely handle features
  let vector = window.map.getAllLayers().find((i) => i.id === "PolygonLayer");
  let vectorSource = vector.getSource();

  // save RoutePlan and sent to service as Json file
  const hendleSaveRoute = (e) => {
    e.preventDefault();

    // popup nutification anchored to save button if no point selected
    setAnchorEl(e.target.querySelector("button:first-of-type"));
    if (routePoint.length >= 1) {
      // send route to service
      let newRoute = {
        Id: uuidv4(),
        Name: routeName,
        OrgId: 8,
        StartAt: moment(startAt).format("DD-MM-YYYY HH:mm"),
        EndAt: moment(endAt).format("DD-MM-YYYY HH:mm"),
        IsActive: false,
        CheckPoints: routePoint,
      };

      dispatch(setRoutePlans(newRoute));
      dispatch(postRoutesAsync(newRoute));

      // navigate to our home table page
      clearLineString();
      navigate("/");
    } else {
      // time out for popup nutification if no point selected
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
      }, 1900);
    }
  };

  const handleCameraChange = (e, Id) => {
    routePoint.forEach((point) => {
      if (point.Id === Id) {
        if (
          e.target.value !== "No Camera" &&
          !point.Devices.includes(e.target.value)
        ) {
          let _obj = point.Devices.filter(
            (elem) => !rawCameraGUID.includes(elem)
          );
          point.Devices = _obj;
          point.Devices.push(e.target.value);
        }

        if (e.target.value === "No Camera") {
          let _obj = point.Devices.filter(
            (elem) => !rawCameraGUID.includes(elem)
          );
          point.Devices = _obj;
        }
      }
    });
  };

  const handleXenonChange = (e, Id) => {
    routePoint.forEach((point) => {
      if (point.Id === Id) {
        if (
          e.target.value !== "No Xenon" &&
          !point.Devices.includes(e.target.value)
        ) {
          point.Devices.push(e.target.value);
        }
        if (e.target.value === "No Xenon") {
          let obj = point.Devices.filter(
            (elem) => !rawXenonGUID.includes(elem)
          );
          point.Devices = obj;
        }
      }
    });
  };

  const handleIntervalTime = (e) => {
    // valiation to enter only numbers
    if (e.target.value >= 0 && e.target.value.length <= 3) {
      // setErrorInterval(false)
      setInterval(e.target.value);
    }
  };

  const handleIntervalTimeChange = (e, Id) => {
    routePoint.forEach((point) => {
      if (point.Id === Id) {
        if (e.target.value > 0 && e.target.value.length <= 3) {
          point.WaitforSeconds = e.target.value;
        }
      }
    });
  };

  const handleSaveTemplate = (e) => {
    e.preventDefault();

    if (camera === "No Camera" && xenon === "No Xenon") {
      setOpenAlert(true);
    } else {
      if (camera !== "No Camera") {
        devices.push(camera);
      }

      if (xenon !== "No Xenon") {
        devices.push(xenon);
      }

      let pointNumber = routePoint.length + 1;

      let templatePoint = {
        Id: uuidv4(),
        Name: `Point No. ${pointNumber}`,
        Latitude: coordinates[1].toString(),
        Longitude: coordinates[0].toString(),
        WaitforSeconds: interval,
        Devices: devices,
      };

      setRoutePoints((oldpoints) => [...oldpoints, templatePoint]);
      setCamera("No Camera");
      setXenon("No Xenon");
      setInterval(10);
      setDevices([]);

      // adding new coordinates to global line string to draw line sting as we click on map
      lineString.push([coordinates[0], coordinates[1]]);
      addMarker([coordinates[0], coordinates[1]], pointNumber);
      drawPolygonOnMap();
      const _overlay = window.map.getOverlayById("markerOverlay");
      window.map.removeOverlay(_overlay);
      setOpenAlert(false);
      clearPopupOverLay();
    }
  };

  const clearLineString = () => {
    vectorSource.clear();
  };

  const clearPopupOverLay = () => {
    const _overlay = window.map.getOverlayById("popupMenu");
    window.map.removeOverlay(_overlay);
  };

  const addMarker = (coordinates, pointNumber) => {
    // adding new feature to specific coordinates
    var marker = new Feature(new Point(coordinates));
    var zIndex = 1;
    marker.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 36],
          anchorXUnits: "fraction",
          anchorYUnits: "pixels",
          opacity: 1,
          // size: [20,20],
          scale: 0.12,
          anchorOrigin: "bottom-right",
          offset: [-3, 0],
          src: markerImg,
          zIndex: zIndex,
          color: "#2fff00",
        }),
        text: new Text({
          // font: "25px",
          fill: new Fill({
            color: "#000",
          }),
          scale: 2.5,
          offsetY: -34,
          offsetX: -1,
          text: String(pointNumber),
        }),
        zIndex: zIndex,
      })
    );
    vectorSource.addFeature(marker);
  };

  const styleFunction = (feature) => {
    var geometry = feature.getGeometry();

    let styles = [
      new Style({
        // linestring
        stroke: new Stroke({
          color: "#A349A4",
          width: 3,
        }),
      }),
    ];

    // iterate over each segment to add arrow at the end
    geometry.forEachSegment((start, end) => {
      let dx = end[0] - start[0];
      let dy = end[1] - start[1];
      let rotation = Math.atan2(dy, dx);

      // arrow
      styles.push(
        new Style({
          geometry: new Point(end),
          image: new Icon({
            src: arrowImg,
            color: "#A349A4",
            anchor: [0.75, 0.5],
            scale: 0.1,
            offset: [40, -15],
            rotateWithView: true,
            rotation: -rotation,
          }),
        })
      );
    });

    return styles;
  };

  const drawPolygonOnMap = () => {
    //
    let _lineString = new LineString(lineString);

    let feature = new Feature({
      geometry: _lineString,
    });

    feature.Name = routeName;
    vector.setStyle(styleFunction(feature));
    let source = vector.getSource();
    source.addFeature(feature);
  };

  useEffect(() => {
    const overlay = new Overlay({
      element: popup.current,
      autoPan: true,
      id: "popupMenu",
    });

    // get coordinates of the map by click
    let key = window.map.on("click", (e) => {
      overlay.setPosition(e.coordinate);
      window.map.addOverlay(overlay);
      let _template = "{x},{y}";

      // setting format for coordinates
      let out = format(e.coordinate, _template, 6);
      let splitOut = out.split(",");
      setCoordinates([parseFloat(splitOut[0]), parseFloat(splitOut[1])]);
    });

    // unmounting component by key that the event returns --> unsubscribe
    return () => {
      unByKey(key);
    };
  }, []);

  useEffect(() => {
    let elem = document.createElement("img");
    elem.src = markerImg;
    elem.style.maxHeight = "52px";
    elem.style.maxWidth = "52px";
    elem.style.filter =
      "invert(49%) sepia(51%) saturate(697%) hue-rotate(63deg) brightness(93%) contrast(88%)";

    let markerOverlay = new Overlay({
      element: elem,
      positioning: "bottom-center",
      id: "markerOverlay",
      offset: [-1.33, 4],
      stopEvent: false,
    });

    let key = window.map.on("click", (e) => {
      markerOverlay.setPosition(e.coordinate);

      window.map.addOverlay(markerOverlay);
    });

    return () => {
      const _overlay = window.map.getOverlayById("markerOverlay");

      window.map.removeOverlay(_overlay);

      unByKey(key);
    };
  }, []);

  return (
    <div id="setRoute" className="setRoute">
      <ThemeProvider theme={theme}>
        <Box component="form" onSubmit={hendleSaveRoute} autoComplete="off">
          <div className="setRoute__box-textAndDateInput">
            <TextField
              label="Route Name"
              InputLabelProps={{ shrink: true }}
              size="small"
              required={true}
              id="RouteName"
              placeholder="Enter Route name..."
              onChange={(e) => setRouteName(e.target.value)}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDateTimePicker
                ampm={false}
                renderInput={(props) => (
                  <TextField
                    sx={{ cursor: "pointer" }}
                    required={true}
                    size="small"
                    {...props}
                  />
                )}
                label="Starting Date"
                value={startAt}
                minDateTime={new Date()}
                onChange={(newValue) => {
                  setStartAt(newValue);
                }}
              />

              <MobileDateTimePicker
                ampm={false}
                renderInput={(params) => (
                  <TextField
                    sx={{ cursor: "pointer" }}
                    required={true}
                    size="small"
                    {...params}
                  />
                )}
                value={startAt > endAt ? startAt : endAt}
                label="End Date"
                minDateTime={startAt}
                onChange={(newValue) => {
                  setEndAt(newValue);
                }}
              />
            </LocalizationProvider>

            <div className="setRoute__box-buttonActions">
              <Button
                aria-describedby={submit}
                type="submit"
                variant="contained"
              >
                Save Route
              </Button>
              <Popover
                id={submit}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <Typography sx={{ p: 2 }}>
                  Please select at least one point
                </Typography>
              </Popover>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/");
                  clearPopupOverLay();
                  clearLineString();
                }}
              >
                Back
              </Button>
            </div>
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "17px",
                      fontWeight: "bold",
                    }}
                  >
                    Point No`
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "17px",
                      fontWeight: "bold",
                    }}
                  >
                    Laitude
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "17px",
                      fontWeight: "bold",
                    }}
                  >
                    Longitde
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "17px",
                      fontWeight: "bold",
                    }}
                  >
                    Interval
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "17px",
                      fontWeight: "bold",
                    }}
                  >
                    Camera
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "17px",
                      fontWeight: "bold",
                    }}
                  >
                    Xenon
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routePoint.map((route, index) => {
                  let _defaultCameraValue = !route.Devices.some((elem) =>
                    rawCameraGUID.includes(elem)
                  )
                    ? "No Camera"
                    : route.Devices.filter((elem) =>
                        rawCameraGUID.includes(elem)
                      );
                  let _defaultXenonValue = !route.Devices.some((elem) =>
                    rawXenonGUID.includes(elem)
                  )
                    ? "No Xenon"
                    : route.Devices.filter((elem) =>
                        rawXenonGUID.includes(elem)
                      );

                  return (
                    <TableRow key={index} hover={true}>
                      <TableCell sx={{ width: "100px", fontSize: "16px" }}>
                        {route.Name}
                      </TableCell>
                      <TableCell sx={{ width: "100px", fontSize: "17px" }}>
                        {route.Latitude}
                      </TableCell>
                      <TableCell sx={{ width: "100px", fontSize: "17px" }}>
                        {route.Longitude}
                      </TableCell>
                      <TableCell>
                        <TextField
                          className="setRoute__inputIntervalField"
                          sx={{ width: "66px" }}
                          type="number"
                          size="small"
                          required={true}
                          defaultValue={route.WaitforSeconds}
                          label="Seconds(10-180)"
                          onChange={(e) => {
                            handleIntervalTimeChange(e, route.Id);
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ width: "100px", fontSize: "17px" }}>
                        <FormControl fullWidth>
                          <InputLabel id="TableCameraLabelId">
                            Camera
                          </InputLabel>
                          <Select
                            sx={{ width: "130px" }}
                            labelId="TableCameLabelId"
                            label="TableCamera"
                            defaultValue={_defaultCameraValue}
                            onChange={(e) => {
                              handleCameraChange(e, route.Id);
                            }}
                          >
                            {window.rawCamera.map((camera) => {
                              return (
                                <MenuItem
                                  value={camera.DeviceId}
                                  key={camera.DeviceId}
                                >
                                  {camera.DeviceName}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ width: "100px", fontSize: "17px" }}>
                        <FormControl fullWidth>
                          <InputLabel id="TableXenonLabelId">Xenon</InputLabel>
                          <Select
                            sx={{ width: "130px" }}
                            labelId="TableXenonLabelId"
                            label="TableXenon"
                            defaultValue={_defaultXenonValue}
                            onChange={(e) => {
                              handleXenonChange(e, route.Id);
                            }}
                          >
                            {window.rawXenon.map((_xenon) => {
                              return (
                                <MenuItem
                                  value={_xenon.DeviceId}
                                  key={_xenon.DeviceId}
                                >
                                  {_xenon.DeviceName}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <div ref={popup} id="popup">
          <Box component="form" onSubmit={handleSaveTemplate}>
            <Paper elevation={6}>
              <CardHeader title="Choose Devices" />
              <CardContent>
                <Stack spacing={2} direction={"column"}>
                  <FormControl fullWidth>
                    <InputLabel id="CameraLabelId">Camera</InputLabel>
                    <Select
                      id="CameraSelectId"
                      labelId="CameLabelId"
                      label="Camera"
                      value={camera}
                      required={true}
                      onChange={(e) => {
                        setCamera(e.target.value);
                      }}
                    >
                      {window.rawCamera.map((camera) => {
                        return (
                          <MenuItem
                            value={camera.DeviceId}
                            key={camera.DeviceId}
                          >
                            {camera.DeviceName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <FormControl required={true} fullWidth>
                    <InputLabel id="XenonLabelId">Xenon</InputLabel>
                    <Select
                      labelId="XenonLabelId"
                      label="Xenon"
                      value={xenon}
                      onChange={(e) => {
                        setXenon(e.target.value);
                      }}
                    >
                      {window.rawXenon.map((_xenon) => {
                        return (
                          <MenuItem
                            value={_xenon.DeviceId}
                            key={_xenon.DeviceId}
                          >
                            {_xenon.DeviceName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <TextField
                    className="setRoute__inputIntervalField"
                    type="number"
                    inputProps={{ maxLength: 1000 }}
                    size="small"
                    value={interval}
                    label="Seconds(10-180)"
                    onChange={handleIntervalTime}
                    helperText="Enter only Numbers"
                  />
                  <Button
                    id="Button_saveTemplate"
                    variant="contained"
                    type="submit"
                  >
                    Save
                  </Button>
                  <Collapse in={openAlert}>
                    <Alert severity="info" sx={{ mb: 2, width: "300px" }}>
                      "Please select at least one Device before continuing
                    </Alert>
                  </Collapse>
                </Stack>
              </CardContent>
            </Paper>
          </Box>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default SetRoute;
