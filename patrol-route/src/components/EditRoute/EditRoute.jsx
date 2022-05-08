import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Collapse,
  createTheme,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import Icon from "ol/style/Icon";
import Overlay from "ol/Overlay";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { updateRoute, updateRouteAsync } from "../../redux/patroslSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import arrowImage from "../../images/arrow2.png";
import markerImg from "../../images/marker.png";
import moment from "moment";
import "./EditRoute.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { format } from "ol/coordinate";
import { unByKey } from "ol/Observable";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

function EditRoute() {
  const state = useSelector((state) => state.patrols);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let route = state.RouteToEdit;
  const [routeName, setRouteName] = useState(route.Name);
  const [startAt, setStartAt] = useState(route.StartAt);
  const [endAt, setEndAt] = useState(route.EndAt);
  const [coordinates, setCoordinates] = useState();
  const [interval, setInterval] = useState(10);
  const [openAlert, setOpenAlert] = useState(false);
  const [camera, setCamera] = useState("No Camera");
  const [xenon, setXenon] = useState("No Xenon");
  const [devices, setDevices] = useState([]);
  const [lineString, setLineString] = useState([]);
  const [routePoint, setRoutePoints] = useState(route.CheckPoints);
  const [lastShownPoint, setLastShownPoint] = useState(null);
  const popup = useRef();

  const convertToTimeObj = (dateStr) => {
    let date = dateStr.split(" ");
    let dateObj = new Date(
      date[0].split("-")[2],
      date[0].split("-")[1] - 1,
      date[0].split("-")[0],
      date[1].split(":")[0],
      date[1].split(":")[1]
    );

    return dateObj;
  };

  // on load component change the date format from string to object date so
  // that our calender can work with date from our route
  useEffect(() => {
    // conver start date to date obj
    if (startAt !== "undefined" || startAt === "") {
      setStartAt(convertToTimeObj(startAt));
    } else setStartAt(new Date());

    if (endAt !== "undefined" || endAt === "") {
      setEndAt(convertToTimeObj(endAt));
    } else setEndAt(new Date());
  }, []);

  const theme = createTheme({
    palette: {
      primary: {
        main: "#d85728",
      },
    },
  });

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

  const handleDeletePoint = (pointId) => {
    removeRouteFromMap();
    let newRoutePoint = routePoint.filter((point) => point.Id !== pointId);

    let coordinates = newRoutePoint.map((point) => {
      let coor = [parseFloat(point.Longitude), parseFloat(point.Latitude)];
      let coordinate = fromLonLat([coor[0], coor[1]], "EPSG:4326");
      return coordinate;
    });
    setLineString(coordinates);
    setRoutePoints(
      newRoutePoint.map((_point, index) => {
        return { ..._point, Name: `Point No. ${index + 1}` };
      })
    );
    // removeRouteFromMap();
    drawPolygonOnMap(coordinates, route.Name);
    setLastShownPoint(null);
  };

  const handleCameraChange = (e, id) => {
    // routePoint.forEach
    let newRoutePoint = routePoint.map((point) => {
      if (point.Id === id) {
        if (
          e.target.value !== "No Camera" &&
          !point.Devices.includes(e.target.value)
        ) {
          let _obj = point.Devices.filter(
            (elem) => !rawCameraGUID.includes(elem)
          );
          _obj.push(e.target.value);
          return { ...point, Devices: [..._obj] };

          // route = {
          //   ...route,
          //   CheckPoints: routePoint.map((_point) => {
          //     return _point.Id === id
          //       ? { ..._point, Devices: _obj }
          //       : { ..._point };
          //   }),
          // };
          // setRoutePoints(route.CheckPoints);
        }

        if (e.target.value === "No Camera") {
          let _obj = point.Devices.filter(
            (elem) => !rawCameraGUID.includes(elem)
          );
          return { ...point, Devices: [..._obj] };
          // route = {
          //   ...route,
          //   CheckPoints: routePoint.map((_point) => {
          //     return _point.Id === id
          //       ? { ..._point, Devices: _obj }
          //       : { ..._point };
          //   }),
          // };

          // setRoutePoints(route.CheckPoints);
        }
      } else {
        return { ...point };
      }
    });
    setRoutePoints(newRoutePoint);
  };

  const handleXenonChange = (e, id) => {
    // route.CheckPoints.forEach((point) => {
    let newRoutePoint = routePoint.map((point) => {
      if (point.Id === id) {
        if (
          e.target.value !== "No Xenon" &&
          !point.Devices.includes(e.target.value)
        ) {
          let _obj = point.Devices.filter(
            (elem) => !rawXenonGUID.includes(elem)
          );

          _obj.push(e.target.value);
          return { ...point, Devices: [..._obj] };
          // route = {
          //   ...route,
          //   CheckPoints: routePoint.map((_point) => {
          //     return _point.Id === id
          //       ? { ..._point, Devices: _obj }
          //       : { ..._point };
          //   }),
          // };
          // setRoutePoints(route.CheckPoints);
        }

        if (e.target.value === "No Xenon") {
          let _obj = point.Devices.filter(
            (elem) => !rawXenonGUID.includes(elem)
          );
          return { ...point, Devices: [..._obj] };
          // route = {
          //   ...route,
          //   CheckPoints: routePoint.map((_point) => {
          //     return _point.Id === id
          //       ? { ..._point, Devices: _obj }
          //       : { ..._point };
          //   }),
          // };
          // setRoutePoints(route.CheckPoints);
        }

        // setRoutePoints(route.CheckPoints);
      } else {
        return { ...point };
      }
    });
    setRoutePoints(newRoutePoint);
  };

  const handleIntervalTime = (e, id) => {
    let reg = /^[1-9]+[0-9]*$/;

    let newRoutePoint = routePoint.map((point) => {
      if (point.Id === id && reg.test(e.target.value)) {
        return { ...point, WaitforSeconds: e.target.value };
      } else {
        return { ...point };
      }
    });
    console.log(newRoutePoint);
    setRoutePoints(newRoutePoint);
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
      route = {
        ...route,
        CheckPoints: [...route.CheckPoints, templatePoint],
      };
      console.log(route.CheckPoints);
      setCamera("No Camera");
      setXenon("No Xenon");
      setInterval(10);
      setDevices([]);

      // adding new coordinates to global line string to draw line sting as we click on map
      lineString.push([coordinates[0], coordinates[1]]);

      addMarker([coordinates[0], coordinates[1]]);
      drawPolygonOnMap(lineString, route.Name);

      const _overlay = window.map.getOverlayById("markerOverlay");
      window.map.removeOverlay(_overlay);
      setOpenAlert(false);
      clearPopupOverLay();
    }
  };

  const handleSaveChange = () => {
    let newRoute = {
      ...route,
      Name: routeName,
      StartAt: moment(startAt).format("DD-MM-YYYY HH:mm"),
      EndAt: moment(endAt).format("DD-MM-YYYY HH:mm"),
      CheckPoints: routePoint,
    };

    dispatch(updateRoute(newRoute));
    dispatch(updateRouteAsync(newRoute));
    removeRouteFromMap();
    navigate("/");
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
            src: arrowImage,
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

  const drawPolygonOnMap = (coordinates, routeName) => {
    setCoordinates(coordinates);
    let _lineString = new LineString(coordinates);
    let feature = new Feature({
      geometry: _lineString,
    });
    feature.Name = routeName;
    addMarker(coordinates);
    let vector = window.map.getAllLayers().find((i) => i.id === "PolygonLayer");
    vector.setStyle(styleFunction(feature));
    let source = vector.getSource();
    source.addFeature(feature);
  };

  const removeRouteFromMap = () => {
    let _vector = window.map
      .getAllLayers()
      .find((i) => i.id === "PolygonLayer");
    if (typeof _vector === "undefined") {
      return;
    }
    let source = _vector.getSource();
    source.clear();
  };

  const addMarker = (coordinates) => {
    let vector = window.map.getAllLayers().find((i) => i.id === "PolygonLayer");
    let vectorSource = vector.getSource();
    // adding new feature to specific coordinates
    coordinates.forEach((point, index) => {
      var marker = new Feature(new Point(point));
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
            text: String(index + 1),
          }),
          zIndex: zIndex,
        })
      );
      vectorSource.addFeature(marker);
    });
  };

  const clearPopupOverLay = () => {
    const _overlay = window.map.getOverlayById("popupMenu");
    window.map.removeOverlay(_overlay);
  };

  // function to hight light the specific point of route
  const showPoint = (coordinates, color) => {
    // adding new feature to specific coordinates
    // if (lastShownPoint !== null) {
    //   showPoint(lastShownPoint, "#2fff00");
    // }
    if (coordinates !== null) {
      let vector = window.map
        .getAllLayers()
        .find((i) => i.id === "PolygonLayer");
      let vectorSource = vector.getSource();
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
            color: color,
          }),
          zIndex: zIndex,
        })
      );
      vectorSource.addFeature(marker);
      setLastShownPoint(coordinates);
    }
  };

  // hight light the specific point of route
  const handleShowPoint = (e) => {
    if (lastShownPoint !== null) {
      showPoint(lastShownPoint, "#2fff00");
      showPoint([e.Longitude, e.Latitude], "#ff0000");
      setLastShownPoint([e.Longitude, e.Latitude]);
    } else if (lastShownPoint === null) {
      showPoint([e.Longitude, e.Latitude], "#ff0000");
      setLastShownPoint([e.Longitude, e.Latitude]);
    }
  };

  // create overlay by on click to choose starting component
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

  // adding pop img to click point on map
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
  // draw initial route on map
  useEffect(() => {
    let coordinates = route.CheckPoints.map((point) => {
      let coor = [parseFloat(point.Longitude), parseFloat(point.Latitude)];
      let coordinate = fromLonLat([coor[0], coor[1]], "EPSG:4326");
      return coordinate;
    });
    // setCoordinates(coordinates);
    setLineString(coordinates);
    drawPolygonOnMap(coordinates, route.Name);
  }, []);

  return (
    <div className="editRoute">
      <ThemeProvider theme={theme}>
        <div className="editRoute__Title">
          <Typography variant="h3">Edit Selected Route</Typography>
        </div>

        <Box component="form" autoComplete="off" onSubmit={handleSaveChange}>
          <div className="editRoute__NameAndDate">
            <div className="editRoute__NameAndDate-wrapper">
              <TextField
                label="Route name"
                InputLabelProps={{ shrink: true }}
                size="small"
                placeholder="Enter Route Name..."
                required={true}
                // value={routeName}
                defaultValue={routeName}
                onChange={(e) => {
                  setRouteName(e.target.value);
                }}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MobileDateTimePicker
                  ampm={false}
                  label="Starting Date"
                  renderInput={(props) => (
                    <TextField
                      sx={{ cursor: "pointer" }}
                      required={true}
                      size={"small"}
                      {...props}
                    />
                  )}
                  clearable={false}
                  value={startAt}
                  minDateTime={new Date()}
                  onChange={(newValue) => {
                    // set start at time
                    setStartAt(newValue !== null ? newValue : startAt);
                    // set dynamecly new end time depending on start at time
                    setEndAt(newValue > endAt ? newValue : endAt);
                  }}
                />

                <MobileDateTimePicker
                  ampm={false}
                  label="End Date"
                  renderInput={(props) => (
                    <TextField required={true} size={"small"} {...props} />
                  )}
                  minDateTime={startAt}
                  value={endAt}
                  onChange={(newValue) => {
                    setEndAt(newValue !== null ? newValue : endAt);
                  }}
                />
              </LocalizationProvider>
            </div>
            <div className="editRoute__buttons">
              <Button variant="contained" type="submit">
                Save
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/");
                  removeRouteFromMap();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "110px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    Point No`
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    Longitude
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    Latitude
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    Interval
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    Camera
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    Xenon
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "100px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {"Actions"}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routePoint?.map((point) => {
                  let _defaultCameraValue = !point.Devices.some((elem) =>
                    rawCameraGUID.includes(elem)
                  )
                    ? "No Camera"
                    : point.Devices.filter((elem) =>
                        rawCameraGUID.includes(elem)
                      );
                  let _defaultXenonValue = !point.Devices.some((elem) =>
                    rawXenonGUID.includes(elem)
                  )
                    ? "No Xenon"
                    : point.Devices.filter((elem) =>
                        rawXenonGUID.includes(elem)
                      );

                  return (
                    <TableRow key={point.Id} hover={true}>
                      <TableCell sx={{ width: "50px", fontSize: "16px" }}>
                        {point.Name}
                      </TableCell>

                      <TableCell sx={{ width: "80px", fontSize: "17px" }}>
                        {point.Latitude}
                      </TableCell>

                      <TableCell sx={{ width: "80px", fontSize: "17px" }}>
                        {point.Longitude}
                      </TableCell>

                      <TableCell sx={{ width: "50px", fontSize: "17px" }}>
                        <TextField
                          className="editRoute__inputIntervalField"
                          sx={{ width: "66px", fontSize: "17px" }}
                          type="number"
                          size="small"
                          defaultValue={point.WaitforSeconds}
                          label="Seconds(10-180)"
                          onChange={(e) => {
                            handleIntervalTime(e, point.Id);
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ width: "100px", fontSize: "17px" }}>
                        <FormControl>
                          <InputLabel id="TableCameraLabelId">
                            Camera
                          </InputLabel>

                          <Select
                            sx={{ width: "130px" }}
                            labelId="TableCameLabelId"
                            label="TableCamera"
                            value={_defaultCameraValue}
                            onChange={(e) => {
                              handleCameraChange(e, point.Id);
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
                            value={_defaultXenonValue}
                            onChange={(e) => {
                              handleXenonChange(e, point.Id);
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
                      <TableCell>
                        <div className="editRoute_actionCell">
                          <Tooltip title="Delete" arrow>
                            <DeleteIcon
                              sx={{ cursor: "pointer" }}
                              onClick={() => {
                                handleDeletePoint(point.Id);
                              }}
                            />
                          </Tooltip>

                          <Tooltip title="Show Point" arrow>
                            <VisibilityIcon
                              sx={{ cursor: "pointer" }}
                              onClick={() => {
                                handleShowPoint(point);
                              }}
                            />
                          </Tooltip>
                        </div>
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
                    onChange={(e) => {
                      setInterval(e.target.value);
                    }}
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

export default EditRoute;
