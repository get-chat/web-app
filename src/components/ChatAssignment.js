import React, {useEffect, useState} from "react";
import {
    Button, CircularProgress,
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

    const retrieveChat = () => {
        axios.get( `${BASE_URL}chats/${props.waId}/`, getConfig())
            .then((response) => {
                console.log("Chat: ", response.data);

                // Update chats data
                // Now updated automatically via socket event
                /*const chat = response.data;
                if (chat) {
                    props.setChats(prevState => {
                        prevState[props.waId].assignedToUser = chat.assigned_to_user;
                        prevState[props.waId].assignedGroup = chat.assigned_group;

                        return {...prevState};
                    })
                }*/

                close();
            })
            .catch((error) => {
                window.displayError(error);
            });
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

                // Retrieve chat and update chats data
                retrieveChat();
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

    const prepareUserLabel = (user) => {
        let label = '';
        if (user.first_name) {
            label = user.first_name;
        }

        if (user.last_name) {
            if (label) {
                label += ' ';
            }

            label += user.last_name;
        }

        if (label) {
            label += ` (${user.username})`;
        } else {
            label = user.username;
        }

        return label;
    }

    return (
        <Dialog open={props.open} onClose={close} className="chatAssignmentWrapper">
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
                        <MenuItem value="null">Unassigned</MenuItem>
                        {users?.map((user) =>
                            <MenuItem key={user.id} value={user.id}>{prepareUserLabel(user)}</MenuItem>
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