class UserClass {

    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        this.groups = data.groups;
        this.permissions = data.permissions;
        this.profile = data.profile;
    }

    isBot() {
        if (this.groups) {
            for (let i = 0; i < this.groups.length; i++) {
                const group = this.groups[i];
                if (group.name === 'App integration') {
                    return true;
                }
            }
        }

        return false;
    }
}

export default UserClass;