import {
  Box,
  Button,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
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
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  deleteRoute,
  deleteRouteAsync,
  getDevicesAsync,
  getHistoryLogAsync,
  getRoutesAsync,
  setRouteToEdit,
  updateRoute,
  updateRouteAsync,
} from "../../redux/patroslSlice";
import Feature from "ol/Feature";
import { fromLonLat } from "ol/proj";
import LineString from "ol/geom/LineString";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { Point } from "ol/geom";
import arrowImg from "../../images/arrow2.png";
import markerImg from "../../images/marker.png";
import Stroke from "ol/style/Stroke";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import "./RoutesTable.css";
import LogWindow from "../logWindow/LogWindow";
import axios from "axios";
import moment from "moment";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

function RoutesTable() {
  let routes = useSelector((state) => state.patrols);
  const [checkRouteId, setCheckRouteId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState(null);
  const [patrolHC, setPatrolHC] = useState(null);
  const [nodeHC, setNodeHC] = useState(null);
  const [lastUpdateHC, setLastUpdateHC] = useState(
    moment(sessionStorage.getItem("LastUpdateDependencies"), "DD-MM-YYYY HH:mm")
  );
  // const [color, setColor] = useState("#d85728");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(async () => {
    dispatch(getRoutesAsync());
    handleCheckNodeBE();
    handleCheckPatrol();
    handleReloadHistory();
  }, [dispatch]);

  // setting theme color
  // useEffect(() => {
  // switch (colorParams.get("color")) {
  //   case "yellow": {
  //     dispatch(setColorTheme("#faba01"));
  //     // setColor("#faba01");
  //     break;
  //   }
  //   case "red": {
  //     dispatch(setColorTheme("#a80000"));
  //     // setColor("#a80000");
  //     break;
  //   }
  //   case "green": {
  //     dispatch(setColorTheme("#668d11"));
  //     // setColor("#668d11");
  //     break;
  //   }
  //   case "blue": {
  //     dispatch(setColorTheme("#115F8D"));
  //     // setColor("#115F8D");
  //     break;
  //   }
  //   case "purple": {
  //     dispatch(setColorTheme("#9a3797"));
  //     // setColor("#9a3797");
  //     break;
  //   }
  //   case "KarmaGreen": {
  //     dispatch(setColorTheme("#009652"));
  //     // setColor("#009652");
  //     break;
  //   }
  //   case "GrayTint": {
  //     dispatch(setColorTheme("#d1d6da"));
  //     // setColor("#d1d6da");
  //     break;
  //   }
  //   case "orange":
  //   default:
  //     dispatch(setColorTheme("#d85728"));
  //     // setColor("#d85728");
  //     break;
  // }
  // }, []);

  const theme = createTheme({
    palette: {
      primary: {
        main: routes.ThemeColor,
      },
    },
    typography: {
      fontFamily: "sans-serif",
    },
  });

  const handleRouteActive = (e, _routeId) => {
    routes.Jetty.forEach((obj) => {
      if ("Jetty" in obj) {
        let newRoutePlan;
        obj.RoutePlans.forEach((route) => {
          // routePlan.Id === _routeId
          // ? {...routePlan, IsActive: e.target.checked} : {...routePlan}
          if (route.Id === _routeId) {
            newRoutePlan = { ...route, IsActive: e.target.checked };
          }
        });

        dispatch(updateRoute(newRoutePlan));
        dispatch(updateRouteAsync(newRoutePlan));
      }
    });
    // dispatch(updateRoute(newRoutePlan))
  };

  const handleDelete = () => {
    setOpen(false);
    dispatch(deleteRoute(routeId));
    dispatch(deleteRouteAsync(routeId));
    removeLinePath();
  };

  const handleEditRoute = (routeId) => {
    // getting specific route plan by id
    let [_route] = routes.Jetty[0].RoutePlans.filter(
      (routePlan) => routePlan.Id === routeId
    );
    dispatch(setRouteToEdit(_route));
    navigate(`/edit-route`);

    removeLinePath();
  };

  const handleShowRoute = (routeId) => {
    let route = routes.Jetty[0].RoutePlans.filter(
      (routePlan) => routePlan.Id === routeId
    );
    route = route[0];
    // console.log('id of route by click ', id);

    if (typeof route === "undefined") {
      console.log("route is undefinded");
      return;
    }

    // getting coordinates to draw new map
    var coordinatesLineString = new Array();

    // gooing over our jason file to get the coordinates points
    for (let i = 0; i < route.CheckPoints.length; i++) {
      const item = route.CheckPoints[i];
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);
      // addMarker([lon,lat])
      // transforming the coordinates to specific format
      var pointTransform = fromLonLat([lon, lat], "EPSG:4326");
      coordinatesLineString.push(pointTransform);
    }

    if (checkRouteId !== routeId) {
      // calling the function that adds layer of drawing on our existing map
      drawPolygonOnMap(coordinatesLineString, route.Id);
    } else {
      // if the route alredy drawn --> we remove it
      removeLinePath();
      setCheckRouteId("");
    }
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

  // const handleSecurityLevel = (e) => {
  //   console.log(e.target.value);
  // }

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
            offset: [0, 0],
            src: markerImg,
            zIndex: zIndex,
            color: "#00ff00",
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

  //function to draw Route on MAP
  function drawPolygonOnMap(coordinates, routeId) {
    setCheckRouteId(routeId);
    removeLinePath();
    // getting the Specific layer from all the Layer in our map
    let _vector = window.map
      .getAllLayers()
      .find((i) => i.id === "PolygonLayer");

    if (typeof _vector === "undefined") {
      return;
    }
    // getting our source of vector
    let source = _vector.getSource();

    //linestring
    let lineString = new LineString(coordinates);

    //polygon
    //var plygon = new PolygonGeom([coordinates])

    // creating new feature for map
    // adding line based on our coordinates
    var feature = new Feature({
      geometry: lineString,
    });

    _vector.setStyle(styleFunction(feature));

    // giving ID to our feature
    feature.Id = routeId;
    addMarker(coordinates);

    source.addFeature(feature);
  }

  // removing the route layer
  function removeLinePath() {
    let _vector = window.map
      .getAllLayers()
      .find((i) => i.id === "PolygonLayer");
    if (typeof _vector === "undefined") {
      return;
    }
    let source = _vector.getSource();
    source.clear();
  }

  // function to reload history of log
  const handleReloadHistory = async () => {
    let res = await axios.get(process.env.REACT_APP_API_LOG_FILR);
    let data = res.data;
    let result = data.map((item) => JSON.parse(item));
    setLog(result);
  };

  // function to send test to patrol service
  const handleTestRoute = async (route) => {
    let testRoute = { ...route, IsActive: true };
    await axios.post(process.env.REACT_APP_TEST, testRoute);
  };

  const handleCheckNodeBE = async () => {
    await axios
      .get(process.env.REACT_APP_NODE_HC)
      .then((resp) => {
        if (resp.data.status === "ok") {
          setTimeout(() => {
            setNodeHC("ok");
          }, 2000);
        }
      })
      .catch((err) => {
        if (err.message === "Network Error") {
          setNodeHC("error");
        }
      });
  };

  const handleCheckPatrol = async () => {
    let patrolHC = await axios.get(process.env.REACT_APP_PATROL_HC);
    if (patrolHC.data.status === "ok") {
      setTimeout(() => {
        setPatrolHC("ok");
      }, 2000);
    } else {
      setPatrolHC("error");
    }
  };

  return (
    <div className="RoutesTable">
      <ThemeProvider theme={theme}>
        <div className="RoutesTable__title">
          <Typography variant="h3">Patrol route</Typography>

          <div id="RoutesTable__AddButton" className="RoutesTable__button">
            <div
              className="RoutesTable__dependencies"
              style={{ border: `1px solid ${routes.ThemeColor}` }}
            >
              <Tooltip title={`Last Update: ${lastUpdateHC}`}>
                <Button
                  variant="contained"
                  onClick={() => {
                    sessionStorage.setItem(
                      "LastUpdateDependencies",
                      new Date()
                    );
                    setLastUpdateHC(
                      moment(new Date()).format("DD-MM-YYYY HH:mm")
                    );
                    setNodeHC("");
                    setPatrolHC("");
                    handleCheckNodeBE();
                    handleCheckPatrol();
                  }}
                >
                  {`Check dependencies`}
                </Button>
              </Tooltip>

              <Tooltip title="Patrol service">
                <MonitorHeartRoundedIcon
                  sx={{ color: patrolHC === "ok" ? "#00c853" : "#000" }}
                  fontSize="large"
                />
              </Tooltip>

              <Tooltip title="Node BE service">
                <MonitorHeartRoundedIcon
                  sx={{ color: nodeHC === "ok" ? "#00c853" : "#000" }}
                  fontSize="large"
                />
              </Tooltip>
            </div>

            <Button
              onClick={() => {
                removeLinePath();
                navigate("/patrol-route");
              }}
              variant="contained"
            >
              Add Route
            </Button>
          </div>
        </div>

        <div className="RoutesTable__securityLever">
          <Typography sx={{ fontSize: "20px" }} variant="h5">
            Recurring time:{" "}
            {routes.Jetty[0] === undefined
              ? " "
              : routes.Jetty[0].IntervalInMinutes}{" "}
            min
          </Typography>

          <Typography sx={{ fontSize: "20px" }} variant="h5">
            Security level: L
            {routes.Jetty[0] === undefined
              ? " "
              : routes.Jetty[0].SecurityLevel}
          </Typography>
        </div>

        <TableContainer
          sx={{ height: "380px", minHeight: "44.5%", maxHeight: "48%" }}
        >
          <Table
            stickyHeader={true}
            aria-label="sticky table"
            size="small"
            className="RoutesTable__table"
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ width: "1%", fontSize: "17px", fontWeight: "bold" }}
                >
                  Id
                </TableCell>
                <TableCell
                  sx={{ width: "100px", fontSize: "17px", fontWeight: "bold" }}
                >
                  Route
                </TableCell>
                <TableCell
                  sx={{ width: "100px", fontSize: "17px", fontWeight: "bold" }}
                >
                  Starting Date
                </TableCell>
                <TableCell
                  sx={{ width: "100px", fontSize: "17px", fontWeight: "bold" }}
                >
                  End Date
                </TableCell>
                <TableCell
                  sx={{
                    width: "100px",
                    fontSize: "17px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Actions
                </TableCell>
                {/* <TableCell>Security Level</TableCell> */}
                <TableCell
                  sx={{ width: "10%", fontSize: "17px", fontWeight: "bold" }}
                >
                  Active
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.Jetty[0] === undefined ? (
                <TableRow></TableRow>
              ) : (
                routes.Jetty[0].RoutePlans.map((route, index) => {
                  return (
                    <TableRow key={index} hover={true}>
                      <TableCell width="1%" sx={{ fontSize: "17px" }}>
                        {index + 1}.
                      </TableCell>
                      <TableCell width="13%" sx={{ fontSize: "17px" }}>
                        {route.Name}
                      </TableCell>
                      <TableCell width="22%" sx={{ fontSize: "15px" }}>
                        {route.StartAt}
                      </TableCell>
                      <TableCell width="22%" sx={{ fontSize: "15px" }}>
                        {route.EndAt}
                      </TableCell>

                      <TableCell>
                        <div className="RoutesTable__actionBlock">
                          <Tooltip title="Show route" arrow>
                            <VisibilityIcon
                              sx={{ cursor: "pointer" }}
                              onClick={() => {
                                handleShowRoute(route.Id);
                              }}
                            />
                          </Tooltip>

                          <Tooltip title="Edit" arrow>
                            <EditIcon
                              sx={{ cursor: "pointer" }}
                              onClick={() => {
                                handleEditRoute(route.Id);
                              }}
                            />
                          </Tooltip>

                          <Tooltip title="Delete" arrow>
                            <DeleteIcon
                              sx={{ cursor: "pointer" }}
                              onClick={() => {
                                setOpen(true);
                                setRouteId(route.Id);
                              }}
                            />
                          </Tooltip>

                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              handleTestRoute(route);
                            }}
                          >
                            TEST
                          </Button>
                        </div>
                      </TableCell>
                      <Dialog
                        open={open}
                        onClose={() => {
                          setOpen(false);
                        }}
                        aria-describedby="alert-delete"
                      >
                        <DialogContent>
                          <DialogContentText id="alert-delete">
                            Are you sure you want to delete this Route?
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleDelete}>Yes</Button>
                          <Button
                            onClick={() => {
                              setOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </DialogActions>
                      </Dialog>

                      <TableCell>
                        <Switch
                          id={`RoutesTable_switch_${index}`}
                          checked={route.IsActive}
                          onChange={(e) => {
                            handleRouteActive(e, route.Id);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="RoutesTable__logWindow">
          <div className="RoutesTable__logWindow-wrapper">
            <h3 className="RoutesTable__logWindow-title">Log</h3>
            <Button variant="contained" onClick={handleReloadHistory}>
              Reload History
            </Button>
          </div>

          <LogWindow log={log} />
        </div>
      </ThemeProvider>
    </div>
  );
}

export default RoutesTable;
