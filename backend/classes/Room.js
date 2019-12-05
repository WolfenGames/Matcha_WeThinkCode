class Room {
    constructor(User1, User2, Log = []) {
        this.User1 = User1
        this.User2 = User2
        this.Log = Log
    }
    AddLog(log) {
        this.Log.push(log)
    }
    getLog()
    {
        return this.Log
    }
}

module.exports = {
    Room: Room
}