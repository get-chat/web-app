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
import '../styles/ChatAssignment.css';

function ChatAssignment(props) {

    const [chat, setChat] = useState();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [assignedToUser, setAssignedToUser] = useState();
    const [assignedGroup, setAssignedGroup] = useState();

    useEffect(() => {
        retrieveChat();
        listUsers();
        listGroups();
    }, []);

    const close = () => {
        props.setOpen(false);
    }

    const retrieveChat = () => {
        axios.get( `${BASE_URL}chats/${props.waId}`, getConfig())
            .then((response) => {
                console.log("Chat: ", response.data);

                setChat(response.data);
            })
            .catch((error) => {
                window.displayError(error);
            });
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

    const listGroups = () => {
        axios.get( `${BASE_URL}groups/`, getConfig())
            .then((response) => {
                console.log("Groups: ", response.data);

                setGroups(response.data.results);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const handleUserChange = (event) => {
        setAssignedToUser(event.target.value);
    }

    const handleGroupChange = (event) => {
        setAssignedGroup(event.target.value);
    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>Assign chat</DialogTitle>
            <DialogContent className="chatAssignment">

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

                <FormControl fullWidth={true}>
                    <InputLabel id="assign-group-select-label">Group</InputLabel>
                    <Select
                        labelId="assign-group-select-label"
                        id="assign-group-select"
                        value={assignedGroup}
                        onChange={handleGroupChange}>
                        {groups?.map((group) =>
                            <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
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