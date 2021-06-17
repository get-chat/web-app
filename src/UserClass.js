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

    prepareUserLabel = () => {
        let label = '';
        if (this.firstName) {
            label = this.firstName;
        }

        if (this.lastName) {
            if (label) {
                label += ' ';
            }

            label += this.lastName;
        }

        if (label) {
            label += ` (${this.username})`;
        } else {
            label = this.username;
        }

        return label;
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