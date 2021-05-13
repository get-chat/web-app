import React, {useEffect, useState} from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel, MenuItem,
    Select
} from "@material-ui/core";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";

function ChatAssignment(props) {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        listUsers();
    }, []);

    const close = () => {
        props.setOpen(false);
    }

    const listUsers = () => {
        axios.get( `${BASE_URL}users/`, getConfig())
            .then((response) => {
                console.log("Users: ", response.data);

                setUsers(response.data.results);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const handleUserChange = (event) => {
        console.log(event.target.value);
    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>Assign chat</DialogTitle>
            <DialogContent>

                <FormControl fullWidth={true}>
                    <InputLabel id="demo-simple-select-label">User</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={""}
                        onChange={handleUserChange}>
                        <MenuItem value={1}>User</MenuItem>
                    </Select>
                </FormControl>

            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                <Button color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChatAssignment;