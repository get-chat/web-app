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
import '../../styles/ChatAssignment.css';
import {listGroupsCall, retrieveChatAssignmentCall, updateChatAssignmentCall} from "../../api/ApiCalls";

function ChatAssignment(props) {

    const [isLoading, setLoading] = useState(true);
    const [isUnableToChange, setUnableToChange] = useState(false);
    const [groups, setGroups] = useState([]);
    const [assignedToUser, setAssignedToUser] = useState();
    const [assignedGroup, setAssignedGroup] = useState();
    const [tempAssignedToUser, setTempAssignedToUser] = useState('null');
    const [tempAssignedGroup, setTempAssignedGroup] = useState('null');

    useEffect(() => {
        listGroups();
    }, []);

    useEffect(() => {
        checkIfUnableToChange();
    }, [assignedGroup, assignedGroup]);

    const close = () => {
        props.setOpen(false);
    }

    const retrieveChatAssignment = () => {
        retrieveChatAssignmentCall(props.waId,
            (response) => {
                // Data on server
                setAssignedToUser(response.data.assigned_to_user);
                setAssignedGroup(response.data.assigned_group);

                // UI data
                setTempAssignedToUser(response.data.assigned_to_user ?? 'null');
                setTempAssignedGroup(response.data.assigned_group ?? 'null');

                setLoading(false);
            }, (error) => {
                if (error?.response?.status === 403) {
                    setLoading(false);
                } else {
                    close();
                }
            });
    }

    const updateChatAssignment = () => {
        updateChatAssignmentCall(
            props.waId,
            tempAssignedToUser === 'null' ? null : tempAssignedToUser,
            tempAssignedGroup === 'null' ? null : tempAssignedGroup,
            (response) => {
                close();
            }, (error) => {
                if (error?.response?.status === 403) {
                    window.displayCustomError('Assignments of this chat have changed recently.');
                }

                close();
            });
    }

    const listGroups = () => {
        listGroupsCall((response) => {
            setGroups(response.data.results);

            // Next
            retrieveChatAssignment();
        });
    }

    const handleUserChange = (event) => {
        const userId = event.target.value;
        setTempAssignedToUser(userId);

        // Set group automatically, if assigned group was blank
        if (!assignedGroup) {
            const firstGroupOfUser = props.users[userId]?.groups?.[0]?.id;
            setTempAssignedGroup(firstGroupOfUser);
        }
    }

    const handleGroupChange = (event) => {
        setTempAssignedGroup(event.target.value);
    }

    const checkIfUnableToChange = () => {
        const isUnable = !props.isAdmin
            && (assignedToUser !== undefined
                && assignedToUser !== null
                && assignedToUser !== props.currentUser.id.toString());
        setUnableToChange(isUnable);
    }

    return (
        <Dialog open={props.open} onClose={close} className="chatAssignmentWrapper">
            <DialogTitle>Assign chat</DialogTitle>
            <DialogContent className="chatAssignment">

                {isUnableToChange &&
                <DialogContentText>
                    This chat is already assigned to another user.
                    You can change the assignment of this chat only if the current person will unassign themselves or
                    someone with admin access will clear the assignment.
                </DialogContentText>
                }

                <DialogContentText>You can assign this chat to a user or a group.</DialogContentText>

                <FormControl fullWidth={true} disabled={isUnableToChange}>
                    <InputLabel id="assign-user-select-label">User</InputLabel>
                    <Select
                        labelId="assign-user-select-label"
                        id="assign-user-select"
                        value={tempAssignedToUser}
                        onChange={handleUserChange}>
                        <MenuItem value="null">Unassigned</MenuItem>
                        {Object.values(props.users)?.map((user) =>
                            <MenuItem key={user.id} value={user.id}>{user.prepareUserLabel()}</MenuItem>
                        )}
                    </Select>
                </FormControl>

                <FormControl fullWidth={true} disabled={isUnableToChange}>
                    <InputLabel id="assign-group-select-label">Group</InputLabel>
                    <Select
                        labelId="assign-group-select-label"
                        id="assign-group-select"
                        value={tempAssignedGroup}
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
                {!isUnableToChange &&
                <Button color="primary" onClick={updateChatAssignment}>Update</Button>
                }
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