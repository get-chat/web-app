class UserClass {

    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        this.permissions = data.permissions;
        this.profile = data.profile;
    }

    isBot() {
        return false;
    }
}