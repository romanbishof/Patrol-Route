import { Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { updateRoute, updateRouteAsync } from '../../redux/patroslSlice';

function EditRoute() {

    // const routes = useSelector((state) => state.patrols[0])
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const route = location.state.route

    const handleCameraChange = (e, id) => {
        route.CheckPoints.forEach(point => {
            if (point.Id === id) {
                point.Devices[0] = e.target.value
            }
        })
    }

    const handleXenonChange = (e, id) => {
        route.forEach(point => {
            if (point.Id === id) {
                point.Devices[1] = e.target.checked ? 'e47f1d52-b035-45dd-b35b-c55511d80f9f' : ''
            }
        })
    }

    const handleSaveChange = () => {

        dispatch(updateRoute(route));
        dispatch(updateRouteAsync(route));
        navigate('/');

    }


    return (
        <div>
            <Box sx={{ padding: 5 }}
                width={950}
            >

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Route Point</TableCell>
                                <TableCell>Longitude</TableCell>
                                <TableCell>Latitude</TableCell>
                                <TableCell>Interval Time</TableCell>
                                <TableCell>Devices</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {route.CheckPoints.map((rout) => {

                                return (
                                    <TableRow key={rout.Id}>
                                        <TableCell>{rout.Name}</TableCell>
                                        <TableCell>{rout.Latitude}</TableCell>
                                        <TableCell>{rout.Longitude}</TableCell>
                                        <TableCell>{rout.WaitforSeconds}</TableCell>
                                        <TableCell>
                                            <FormControl fullWidth>
                                                <InputLabel id='CameraLabelId'>Camera</InputLabel>
                                                <Select
                                                    labelId='CameLabelId'
                                                    label='Camera'
                                                    defaultValue=''
                                                    onChange={(e) => { handleCameraChange(e, rout.Id) }}
                                                >
                                                    <MenuItem value={''}><em>No Camera</em></MenuItem>
                                                    <MenuItem value='b612164b-0313-4e83-95bc-fc2bfc10ea36'>Camera 1</MenuItem>
                                                    <MenuItem value='9a51ffda-86ce-41be-9a5f-183260ec2106'>Camera 2</MenuItem>

                                                </Select>
                                            </FormControl>
                                            <FormControlLabel control={<Switch value={rout.Devices[1] === 'e47f1d52-b035-45dd-b35b-c55511d80f9f' ? true : false} onChange={(e) => { handleXenonChange(e, rout.Id) }} />} label="Xenon" />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Stack direction='row' spacing={5}>
                    <Button variant='contained' onClick={handleSaveChange}>Save</Button>
                    <Button variant='contained' onClick={() => { navigate('/') }}>Back/ Cancle</Button>
                </Stack>
            </Box>
        </div>
    )
}

export default EditRoute