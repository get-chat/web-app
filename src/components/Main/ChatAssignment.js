import React, {useEffect, useState} from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@material-ui/core";
import axios from "axios";
import {BASE_URL} from "../../Constants";
import {getConfig} from "../../helpers/Helpers";
import '../../styles/ChatAssignment.css';
import UserClass from "../../UserClass";

function ChatAssignment(props) {

    const [isLoading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [assignedToUser, setAssignedToUser] = useState('null');
    const [assignedGroup, setAssignedGroup] = useState('null');

    useEffect(() => {
        listUsers();
    }, []);

    const close = () => {
        props.setOpen(false);
    }

    const retrieveChatAssignment = () => {
        axios.get( `${BASE_URL}chat_assignment/${props.waId}/`, getConfig())
            .then((response) => {
                console.log("Assignment: ", response.data);

                setAssignedToUser(response.data.assigned_to_user ?? 'null');
                setAssignedGroup(response.data.assigned_group ?? 'null');

                setLoading(false);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const updateChatAssignment = () => {
        axios.put( `${BASE_URL}chat_assignment/${props.waId}/`, {
            'wa_id': props.waId,
            'assigned_to_user': assignedToUser === 'null' ? null : assignedToUser,
            'assigned_group': assignedGroup === 'null' ? null : assignedGroup,
        }, getConfig())
            .then((response) => {
                console.log("Assignment: ", response.data);

                close();
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const listUsers = () => {
        axios.get( `${BASE_URL}users/`, getConfig())
            .then((response) => {
                console.log("Users: ", response.data);

                const preparedUsers = [];
                response.data.results.forEach((user) => {
                    const prepared = new UserClass(user);
                    preparedUsers.push(prepared);
                });

                setUsers(preparedUsers);

                // Next
                listGroups();
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

                // Next
                retrieveChatAssignment();
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
        <Dialog open={props.open} onClose={close} className="chatAssignmentWrapper">
            <DialogTitle>Assign chat</DialogTitle>
            <DialogContent className="chatAssignment">

                <DialogContentText>You can assign this chat to a user or a group.</DialogContentText>

                <FormControl fullWidth={true}>
                    <InputLabel id="assign-user-select-label">User</InputLabel>
                    <Select
                        labelId="assign-user-select-label"
                        id="assign-user-select"
                        value={assignedToUser}
                        onChange={handleUserChange}>
                        <MenuItem value="null">Unassigned</MenuItem>
                        {users?.map((user) =>
                            <MenuItem key={user.id} value={user.id}>{user.prepareUserLabel()}</MenuItem>
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
                        <MenuItem value="null">Unassigned</MenuItem>
                        {groups?.map((group) =>
                            <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                        )}
                    </Select>
                </FormControl>

            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                <Button color="primary" onClick={updateChatAssignment}>Update</Button>
            </DialogActions>

            {isLoading &&
            <div className="chatAssignmentWrapper__loading">
                <CircularProgress size={28} />
            </div>
            }

        </Dialog>
    )
}

export default ChatAssignment;