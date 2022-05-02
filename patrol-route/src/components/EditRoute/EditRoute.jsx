import {
  Box,
  Button,
  createTheme,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
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
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { updateRoute, updateRouteAsync } from "../../redux/patroslSlice";
import arrowImage from "../../images/arrow2.png";
import markerImg from "../../images/marker.png";
import moment from "moment";
import "./EditRoute.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";

function EditRoute() {
  const state = useSelector((state) => state.patrols);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const route = location.state.route;
  const [routeName, setRouteName] = useState(route.Name);
  const [startAt, setStartAt] = useState(route.StartAt);
  const [endAt, setEndAt] = useState(route.EndAt);
  // console.log(startAt);

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
    state.forEach((obj) => {
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
    state.forEach((obj) => {
      if ("rawXenon" in obj) {
        obj.rawXenon.forEach((_xenon) => {
          window.rawXenon.push(_xenon);
        });
      }
    });
  }

  const handleCameraChange = (e, id) => {
    route.CheckPoints.forEach((point) => {
      if (point.Id === id) {
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

  const handleXenonChange = (e, id) => {
    route.CheckPoints.forEach((point) => {
      if (point.Id === id) {
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

  const handleIntervalTime = (e, id) => {
    let reg = /^[1-9]+[0-9]*$/;

    route.CheckPoints.forEach((point) => {
      if (point.Id === id && reg.test(e.target.value)) {
        point.WaitforSeconds = e.target.value;
      }
    });
  };

  const handleSaveChange = () => {
    route.Name = routeName;
    route.StartAt = moment(startAt).format("DD-MM-YYYY HH:mm");
    route.EndAt = moment(endAt).format("DD-MM-YYYY HH:mm");
    dispatch(updateRoute(route));
    dispatch(updateRouteAsync(route));
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
    let lineString = new LineString(coordinates);
    let feature = new Feature({
      geometry: lineString,
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
    coordinates.forEach((point) => {
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
            scale: 0.1,
            anchorOrigin: "bottom-right",
            offset: [-3, 0],
            src: markerImg,
            zIndex: zIndex,
          }),
          zIndex: zIndex,
        })
      );
      vectorSource.addFeature(marker);
    });
  };

  useEffect(() => {
    // let vector = route
    let coordinates = route.CheckPoints.map((point) => {
      let coor = [parseFloat(point.Longitude), parseFloat(point.Latitude)];
      let coordinate = fromLonLat([coor[0], coor[1]], "EPSG:4326");
      return coordinate;
    });

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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "100px",
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
                </TableRow>
              </TableHead>
              <TableBody>
                {route.CheckPoints.map((rout) => {
                  let _defaultCameraValue = !rout.Devices.some((elem) =>
                    rawCameraGUID.includes(elem)
                  )
                    ? "No Camera"
                    : rout.Devices.filter((elem) =>
                        rawCameraGUID.includes(elem)
                      );
                  let _defaultXenonValue = !rout.Devices.some((elem) =>
                    rawXenonGUID.includes(elem)
                  )
                    ? "No Xenon"
                    : rout.Devices.filter((elem) =>
                        rawXenonGUID.includes(elem)
                      );

                  return (
                    <TableRow key={rout.Id} hover={true}>
                      <TableCell sx={{ width: "50px", fontSize: "16px" }}>
                        {rout.Name}
                      </TableCell>

                      <TableCell sx={{ width: "100px", fontSize: "17px" }}>
                        {rout.Latitude}
                      </TableCell>

                      <TableCell sx={{ width: "100px", fontSize: "17px" }}>
                        {rout.Longitude}
                      </TableCell>

                      <TableCell>
                        <TextField
                          className="editRoute__inputIntervalField"
                          sx={{ width: "66px", fontSize: "17px" }}
                          type="number"
                          size="small"
                          defaultValue={rout.WaitforSeconds}
                          label="Seconds(10-180)"
                          onChange={(e) => {
                            handleIntervalTime(e, rout.Id);
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
                            defaultValue={_defaultCameraValue}
                            onChange={(e) => {
                              handleCameraChange(e, rout.Id);
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

                      <TableCell>
                        <FormControl fullWidth>
                          <InputLabel id="TableXenonLabelId">Xenon</InputLabel>

                          <Select
                            sx={{ width: "130px" }}
                            labelId="TableXenonLabelId"
                            label="TableXenon"
                            defaultValue={_defaultXenonValue}
                            onChange={(e) => {
                              handleXenonChange(e, rout.Id);
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
      </ThemeProvider>
    </div>
  );
}

export default EditRoute;
