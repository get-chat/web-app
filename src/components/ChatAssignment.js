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
    const [assignedToUser, setAssignedToUser] = useState();
    const [assignedGroup, setAssignedGroup] = useState();

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
        setAssignedToUser(event.target.value);
    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>Assign chat</DialogTitle>
            <DialogContent>

                <div className="mb-3">You can assign this chat to a user or a group.</div>

                <FormControl fullWidth={true}>
                    <InputLabel id="assign-user-select-label">User</InputLabel>
                    <Select
                        labelId="assign-user-select-label"
                        id="assign-user-select"
                        value={assignedToUser}
                        onChange={handleUserChange}>
                        {users?.map((user) =>
                            <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
                        )}
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